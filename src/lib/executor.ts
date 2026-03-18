import {
  FlowNode,
  FlowEdge,
  ExecutionLogEntry,
  ExecutionMode,
  NodeExecutionState,
  FlowNodeData,
} from './types';
import { v4 as uuidv4 } from 'uuid';

// ── Execution Engine ────────────────────────────────────────────────────────

export class GraphExecutor {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private variables: Record<string, unknown>;
  private log: ExecutionLogEntry[];
  private completedNodes: Set<string>;
  private paused: boolean;
  private aborted: boolean;
  private mode: ExecutionMode;
  private stepResolve: (() => void) | null;

  // Callbacks
  private onNodeStart?: (nodeId: string) => void;
  private onNodeComplete?: (nodeId: string, output: unknown) => void;
  private onNodeError?: (nodeId: string, error: string) => void;
  private onLog?: (entry: ExecutionLogEntry) => void;
  private onVariableSet?: (key: string, value: unknown) => void;
  private onPause?: () => void;

  constructor(
    nodes: FlowNode[],
    edges: FlowEdge[],
    variables: Record<string, unknown>,
    callbacks: {
      onNodeStart?: (nodeId: string) => void;
      onNodeComplete?: (nodeId: string, output: unknown) => void;
      onNodeError?: (nodeId: string, error: string) => void;
      onLog?: (entry: ExecutionLogEntry) => void;
      onVariableSet?: (key: string, value: unknown) => void;
      onPause?: () => void;
    }
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.variables = { ...variables };
    this.log = [];
    this.completedNodes = new Set();
    this.paused = false;
    this.aborted = false;
    this.mode = 'run';
    this.stepResolve = null;

    this.onNodeStart = callbacks.onNodeStart;
    this.onNodeComplete = callbacks.onNodeComplete;
    this.onNodeError = callbacks.onNodeError;
    this.onLog = callbacks.onLog;
    this.onVariableSet = callbacks.onVariableSet;
    this.onPause = callbacks.onPause;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  async execute(mode: ExecutionMode = 'run'): Promise<{ log: ExecutionLogEntry[]; variables: Record<string, unknown> }> {
    this.mode = mode;
    this.paused = false;
    this.aborted = false;

    const executionOrder = this.topologicalSort();

    for (const nodeId of executionOrder) {
      if (this.aborted) break;

      const node = this.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      // Handle step mode
      if (this.mode === 'step' && this.completedNodes.size > 0) {
        this.paused = true;
        this.onPause?.();
        await this.waitForStep();
      }

      // Handle breakpoints in run-to-breakpoint mode
      if (this.mode === 'run-to-breakpoint' && node.data.breakpoint && this.completedNodes.size > 0) {
        this.paused = true;
        this.onPause?.();
        await this.waitForStep();
      }

      if (this.aborted) break;

      await this.executeNode(node);
    }

    return { log: this.log, variables: this.variables };
  }

  step(): void {
    if (this.stepResolve) {
      this.paused = false;
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  resume(): void {
    this.mode = 'run';
    this.step();
  }

  abort(): void {
    this.aborted = true;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  // ── Node Execution ──────────────────────────────────────────────────────

  private async executeNode(node: FlowNode): Promise<void> {
    const startTime = Date.now();
    const input = this.gatherInput(node);

    this.onNodeStart?.(node.id);

    const logEntry: ExecutionLogEntry = {
      id: uuidv4(),
      nodeId: node.id,
      nodeLabel: node.data.label,
      nodeType: node.data.nodeType,
      status: 'running',
      input,
      output: null,
      startTime,
    };

    try {
      const output = await this.processNode(node, input);

      logEntry.status = 'completed';
      logEntry.output = output;
      logEntry.endTime = Date.now();
      logEntry.duration = logEntry.endTime - startTime;

      this.variables[`${node.id}_output`] = output;
      this.onVariableSet?.(`${node.id}_output`, output);
      this.completedNodes.add(node.id);
      this.onNodeComplete?.(node.id, output);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logEntry.status = 'error';
      logEntry.error = errorMsg;
      logEntry.endTime = Date.now();
      logEntry.duration = logEntry.endTime - startTime;

      this.onNodeError?.(node.id, errorMsg);

      // Check for error handler connections
      const errorEdge = this.edges.find(
        (e) => e.source === node.id && e.sourceHandle === 'error'
      );
      if (!errorEdge) {
        // No error handler, propagate
      }
    }

    this.log.push(logEntry);
    this.onLog?.(logEntry);
  }

  private async processNode(node: FlowNode, input: unknown): Promise<unknown> {
    const data = node.data;
    // Simulate a small execution delay for visual feedback
    await this.delay(300);

    switch (data.nodeType) {
      case 'start':
        return { started: true, timestamp: Date.now() };

      case 'input':
        return data.config.defaultValues || {};

      case 'llm':
        return this.executeLLMNode(data, input);

      case 'tool':
        return this.executeToolNode(data, input);

      case 'branch':
        return this.executeBranchNode(data, input);

      case 'loop':
        return this.executeLoopNode(data, input);

      case 'merge':
        return this.executeMergeNode(data, input);

      case 'transform':
        return this.executeTransformNode(data, input);

      case 'delay':
        return this.executeDelayNode(data, input);

      case 'error-handler':
        return this.executeErrorHandlerNode(data, input);

      case 'output':
        return { result: input, format: data.config.format || 'json' };

      case 'subgraph':
        return { subgraphResult: input, graphId: data.config.graphId };

      default:
        return input;
    }
  }

  // ── Node Type Executors ─────────────────────────────────────────────────

  private async executeLLMNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as {
      model: string;
      systemPrompt: string;
      temperature: number;
      maxTokens: number;
    };
    // Simulated LLM response
    return {
      model: config.model,
      response: `[Simulated ${config.model} response] Processed input with system prompt: "${config.systemPrompt.substring(0, 50)}..."`,
      usage: { promptTokens: 150, completionTokens: 80, totalTokens: 230 },
      temperature: config.temperature,
      input,
    };
  }

  private async executeToolNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { toolName: string; endpoint: string; method: string };
    // Simulated tool call
    return {
      tool: config.toolName,
      endpoint: config.endpoint,
      method: config.method,
      status: 200,
      data: { result: 'Simulated API response', input },
    };
  }

  private async executeBranchNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { conditions: Array<{ label: string; expression: string }> };
    // Evaluate conditions (simplified)
    for (const cond of config.conditions) {
      if (cond.expression === 'default') {
        return { branch: cond.label, matched: true, input };
      }
      try {
        const fn = new Function('input', `return ${cond.expression}`);
        if (fn(input)) {
          return { branch: cond.label, matched: true, input };
        }
      } catch {
        // condition eval failed, try next
      }
    }
    return { branch: 'none', matched: false, input };
  }

  private async executeLoopNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as {
      loopType: string;
      iteratorExpression: string;
      maxIterations: number;
    };
    // Simulated loop
    const iterations = Math.min(3, config.maxIterations);
    const results = [];
    for (let i = 0; i < iterations; i++) {
      results.push({ iteration: i, data: `Item ${i}` });
    }
    return { loopType: config.loopType, iterations, results, input };
  }

  private async executeMergeNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { strategy: string };
    return { strategy: config.strategy, merged: input };
  }

  private async executeTransformNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { transformExpression: string; language: string };
    try {
      if (config.language === 'javascript') {
        const fn = new Function('input', config.transformExpression);
        return fn(input);
      }
    } catch (err) {
      return { error: 'Transform failed', expression: config.transformExpression, input };
    }
    return { transformed: true, input };
  }

  private async executeDelayNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { delayMs: number; delayType: string };
    const delayMs = Math.min(config.delayMs, 5000); // Cap at 5s for simulation
    await this.delay(delayMs);
    return { delayed: true, delayMs, input };
  }

  private async executeErrorHandlerNode(data: FlowNodeData, input: unknown): Promise<unknown> {
    const config = data.config as { retryCount: number; fallbackExpression: string };
    return { handled: true, retryCount: config.retryCount, input };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private gatherInput(node: FlowNode): unknown {
    const incomingEdges = this.edges.filter((e) => e.target === node.id);
    if (incomingEdges.length === 0) return this.variables;

    if (incomingEdges.length === 1) {
      const sourceId = incomingEdges[0].source;
      return this.variables[`${sourceId}_output`] ?? null;
    }

    const inputs: Record<string, unknown> = {};
    for (const edge of incomingEdges) {
      inputs[edge.source] = this.variables[`${edge.source}_output`] ?? null;
    }
    return inputs;
  }

  private topologicalSort(): string[] {
    const inDegree: Record<string, number> = {};
    const adjacency: Record<string, string[]> = {};

    for (const node of this.nodes) {
      inDegree[node.id] = 0;
      adjacency[node.id] = [];
    }

    for (const edge of this.edges) {
      if (adjacency[edge.source]) {
        adjacency[edge.source].push(edge.target);
      }
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target]++;
      }
    }

    const queue: string[] = [];
    for (const nodeId of Object.keys(inDegree)) {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    }

    // Prioritize start nodes
    queue.sort((a, b) => {
      const nodeA = this.nodes.find((n) => n.id === a);
      const nodeB = this.nodes.find((n) => n.id === b);
      if (nodeA?.data.nodeType === 'start') return -1;
      if (nodeB?.data.nodeType === 'start') return 1;
      return 0;
    });

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      for (const neighbor of adjacency[current] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private waitForStep(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.stepResolve = resolve;
    });
  }
}

// ── Executor Factory ────────────────────────────────────────────────────────

let currentExecutor: GraphExecutor | null = null;

export function createExecutor(
  nodes: FlowNode[],
  edges: FlowEdge[],
  variables: Record<string, unknown>,
  callbacks: {
    onNodeStart?: (nodeId: string) => void;
    onNodeComplete?: (nodeId: string, output: unknown) => void;
    onNodeError?: (nodeId: string, error: string) => void;
    onLog?: (entry: ExecutionLogEntry) => void;
    onVariableSet?: (key: string, value: unknown) => void;
    onPause?: () => void;
  }
): GraphExecutor {
  if (currentExecutor) {
    currentExecutor.abort();
  }
  currentExecutor = new GraphExecutor(nodes, edges, variables, callbacks);
  return currentExecutor;
}

export function getCurrentExecutor(): GraphExecutor | null {
  return currentExecutor;
}

export function clearCurrentExecutor(): void {
  if (currentExecutor) {
    currentExecutor.abort();
  }
  currentExecutor = null;
}
