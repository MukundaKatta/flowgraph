import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import {
  FlowNode,
  FlowEdge,
  FlowNodeData,
  FlowNodeType,
  ExecutionState,
  ExecutionLogEntry,
  ExecutionMode,
  NodeExecutionState,
  GraphTemplate,
  CodeLanguage,
} from './types';
import { getDefaultNodeData } from './node-defaults';

// ── Store Interface ─────────────────────────────────────────────────────────

interface FlowGraphStore {
  // Graph data
  graphId: string;
  graphName: string;
  graphDescription: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, unknown>;

  // UI state
  selectedNodeId: string | null;
  activePanel: 'palette' | 'inspector' | 'execution' | 'templates' | 'code' | 'debug';
  codeLanguage: CodeLanguage;
  isDirty: boolean;

  // Execution state
  execution: ExecutionState;

  // Node operations
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: FlowNodeType, position: { x: number; y: number }) => FlowNode;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  duplicateNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;

  // Graph operations
  setGraphName: (name: string) => void;
  setGraphDescription: (desc: string) => void;
  clearGraph: () => void;
  loadTemplate: (template: GraphTemplate) => void;
  exportGraph: () => { nodes: FlowNode[]; edges: FlowEdge[]; name: string; description: string };

  // Variables
  setVariable: (key: string, value: unknown) => void;
  deleteVariable: (key: string) => void;

  // UI
  setActivePanel: (panel: FlowGraphStore['activePanel']) => void;
  setCodeLanguage: (lang: CodeLanguage) => void;

  // Execution
  setExecutionState: (state: Partial<ExecutionState>) => void;
  addLogEntry: (entry: ExecutionLogEntry) => void;
  updateNodeExecutionState: (nodeId: string, state: NodeExecutionState, output?: unknown, error?: string) => void;
  resetExecution: () => void;
  toggleBreakpoint: (nodeId: string) => void;

  // Serialization
  toJSON: () => string;
  fromJSON: (json: string) => void;
}

// ── Initial Execution State ─────────────────────────────────────────────────

const initialExecutionState: ExecutionState = {
  isRunning: false,
  isPaused: false,
  mode: 'run',
  currentNodeId: null,
  executionOrder: [],
  completedNodes: new Set(),
  log: [],
  variables: {},
  startTime: null,
  endTime: null,
  error: null,
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useFlowGraphStore = create<FlowGraphStore>((set, get) => ({
  // Initial state
  graphId: uuidv4(),
  graphName: 'Untitled Graph',
  graphDescription: '',
  nodes: [],
  edges: [],
  variables: {},
  selectedNodeId: null,
  activePanel: 'palette',
  codeLanguage: 'python',
  isDirty: false,
  execution: { ...initialExecutionState },

  // ── Node Changes ────────────────────────────────────────────────────────

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as FlowNode[],
      isDirty: true,
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          style: { stroke: '#6366f1', strokeWidth: 2 },
        },
        state.edges
      ),
      isDirty: true,
    }));
  },

  addNode: (type, position) => {
    const id = uuidv4();
    const data = getDefaultNodeData(type);
    const newNode: FlowNode = {
      id,
      type: `custom-${type}`,
      position,
      data,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
    }));
    return newNode;
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as FlowNodeData } : n
      ),
      isDirty: true,
    }));
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const newNode: FlowNode = {
      ...node,
      id: uuidv4(),
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: { ...node.data, label: `${node.data.label} (copy)` },
      selected: false,
    };
    set((s) => ({
      nodes: [...s.nodes, newNode],
      isDirty: true,
    }));
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  // ── Graph Operations ──────────────────────────────────────────────────

  setGraphName: (name) => set({ graphName: name, isDirty: true }),
  setGraphDescription: (desc) => set({ graphDescription: desc, isDirty: true }),

  clearGraph: () => {
    set({
      nodes: [],
      edges: [],
      variables: {},
      selectedNodeId: null,
      isDirty: true,
      execution: { ...initialExecutionState },
    });
  },

  loadTemplate: (template) => {
    set({
      graphId: uuidv4(),
      graphName: template.name,
      graphDescription: template.description,
      nodes: template.nodes.map((n) => ({ ...n, id: n.id || uuidv4() })),
      edges: template.edges,
      variables: {},
      selectedNodeId: null,
      isDirty: false,
      execution: { ...initialExecutionState },
    });
  },

  exportGraph: () => {
    const s = get();
    return {
      nodes: s.nodes,
      edges: s.edges,
      name: s.graphName,
      description: s.graphDescription,
    };
  },

  // ── Variables ─────────────────────────────────────────────────────────

  setVariable: (key, value) => {
    set((state) => ({
      variables: { ...state.variables, [key]: value },
    }));
  },

  deleteVariable: (key) => {
    set((state) => {
      const vars = { ...state.variables };
      delete vars[key];
      return { variables: vars };
    });
  },

  // ── UI ────────────────────────────────────────────────────────────────

  setActivePanel: (panel) => set({ activePanel: panel }),
  setCodeLanguage: (lang) => set({ codeLanguage: lang }),

  // ── Execution ─────────────────────────────────────────────────────────

  setExecutionState: (partial) => {
    set((state) => ({
      execution: { ...state.execution, ...partial },
    }));
  },

  addLogEntry: (entry) => {
    set((state) => ({
      execution: {
        ...state.execution,
        log: [...state.execution.log, entry],
      },
    }));
  },

  updateNodeExecutionState: (nodeId, execState, output, error) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                executionState: execState,
                lastOutput: output !== undefined ? output : n.data.lastOutput,
                error: error || (execState === 'error' ? n.data.error : undefined),
              } as FlowNodeData,
            }
          : n
      ),
    }));
  },

  resetExecution: () => {
    set((state) => ({
      execution: { ...initialExecutionState },
      nodes: state.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionState: 'idle' as NodeExecutionState,
          lastOutput: undefined,
          lastInput: undefined,
          error: undefined,
        } as FlowNodeData,
      })),
    }));
  },

  toggleBreakpoint: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, breakpoint: !n.data.breakpoint } as FlowNodeData }
          : n
      ),
    }));
  },

  // ── Serialization ─────────────────────────────────────────────────────

  toJSON: () => {
    const s = get();
    return JSON.stringify(
      {
        id: s.graphId,
        name: s.graphName,
        description: s.graphDescription,
        nodes: s.nodes.map((n) => ({
          ...n,
          data: { ...n.data, executionState: undefined, lastOutput: undefined, lastInput: undefined, error: undefined },
        })),
        edges: s.edges,
        variables: s.variables,
      },
      null,
      2
    );
  },

  fromJSON: (json) => {
    const data = JSON.parse(json);
    set({
      graphId: data.id || uuidv4(),
      graphName: data.name || 'Imported Graph',
      graphDescription: data.description || '',
      nodes: data.nodes || [],
      edges: data.edges || [],
      variables: data.variables || {},
      selectedNodeId: null,
      isDirty: false,
      execution: { ...initialExecutionState },
    });
  },
}));
