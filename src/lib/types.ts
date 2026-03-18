import { Node, Edge } from 'reactflow';

// ── Node Types ──────────────────────────────────────────────────────────────

export type FlowNodeType =
  | 'start'
  | 'llm'
  | 'tool'
  | 'branch'
  | 'loop'
  | 'merge'
  | 'transform'
  | 'input'
  | 'output'
  | 'subgraph'
  | 'delay'
  | 'error-handler';

export interface NodePort {
  id: string;
  label: string;
  type: 'input' | 'output';
}

export interface BaseNodeData {
  label: string;
  description: string;
  nodeType: FlowNodeType;
  config: Record<string, unknown>;
  ports: NodePort[];
  breakpoint: boolean;
  executionState?: NodeExecutionState;
  lastOutput?: unknown;
  lastInput?: unknown;
  error?: string;
}

export interface LLMNodeData extends BaseNodeData {
  nodeType: 'llm';
  config: {
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    inputMapping: string;
  };
}

export interface ToolNodeData extends BaseNodeData {
  nodeType: 'tool';
  config: {
    toolName: string;
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    bodyTemplate: string;
    outputMapping: string;
  };
}

export interface BranchNodeData extends BaseNodeData {
  nodeType: 'branch';
  config: {
    conditions: BranchCondition[];
  };
}

export interface BranchCondition {
  id: string;
  label: string;
  expression: string;
  targetHandle: string;
}

export interface LoopNodeData extends BaseNodeData {
  nodeType: 'loop';
  config: {
    loopType: 'for' | 'while' | 'forEach';
    iteratorExpression: string;
    maxIterations: number;
    breakCondition: string;
  };
}

export interface MergeNodeData extends BaseNodeData {
  nodeType: 'merge';
  config: {
    strategy: 'first' | 'all' | 'custom';
    mergeExpression: string;
  };
}

export interface TransformNodeData extends BaseNodeData {
  nodeType: 'transform';
  config: {
    transformExpression: string;
    language: 'javascript' | 'jsonpath';
  };
}

export interface InputNodeData extends BaseNodeData {
  nodeType: 'input';
  config: {
    inputSchema: Record<string, string>;
    defaultValues: Record<string, unknown>;
  };
}

export interface OutputNodeData extends BaseNodeData {
  nodeType: 'output';
  config: {
    outputMapping: string;
    format: 'json' | 'text' | 'markdown';
  };
}

export interface SubgraphNodeData extends BaseNodeData {
  nodeType: 'subgraph';
  config: {
    graphId: string;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
  };
}

export interface DelayNodeData extends BaseNodeData {
  nodeType: 'delay';
  config: {
    delayMs: number;
    delayType: 'fixed' | 'expression';
    expression: string;
  };
}

export interface ErrorHandlerNodeData extends BaseNodeData {
  nodeType: 'error-handler';
  config: {
    retryCount: number;
    retryDelayMs: number;
    fallbackExpression: string;
    catchPattern: string;
  };
}

export type FlowNodeData =
  | LLMNodeData
  | ToolNodeData
  | BranchNodeData
  | LoopNodeData
  | MergeNodeData
  | TransformNodeData
  | InputNodeData
  | OutputNodeData
  | SubgraphNodeData
  | DelayNodeData
  | ErrorHandlerNodeData
  | BaseNodeData;

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ── Graph State ─────────────────────────────────────────────────────────────

export interface GraphState {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Execution Types ─────────────────────────────────────────────────────────

export type NodeExecutionState = 'idle' | 'queued' | 'running' | 'completed' | 'error' | 'skipped' | 'paused';

export type ExecutionMode = 'run' | 'step' | 'run-to-breakpoint';

export interface ExecutionLogEntry {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: FlowNodeType;
  status: NodeExecutionState;
  input: unknown;
  output: unknown;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface ExecutionState {
  isRunning: boolean;
  isPaused: boolean;
  mode: ExecutionMode;
  currentNodeId: string | null;
  executionOrder: string[];
  completedNodes: Set<string>;
  log: ExecutionLogEntry[];
  variables: Record<string, unknown>;
  startTime: number | null;
  endTime: number | null;
  error: string | null;
}

// ── Template Types ──────────────────────────────────────────────────────────

export interface GraphTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ── Code Generation ─────────────────────────────────────────────────────────

export type CodeLanguage = 'python' | 'typescript';

export interface CodeGenerationOptions {
  language: CodeLanguage;
  includeComments: boolean;
  framework: string;
}

// ── Node Palette ────────────────────────────────────────────────────────────

export interface NodePaletteItem {
  type: FlowNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultData: Partial<FlowNodeData>;
}

// ── Drag/Drop ───────────────────────────────────────────────────────────────

export interface DragData {
  nodeType: FlowNodeType;
  label: string;
}
