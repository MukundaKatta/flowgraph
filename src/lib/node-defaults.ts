import { FlowNodeType, FlowNodeData, NodePaletteItem } from './types';

export function getDefaultNodeData(type: FlowNodeType): FlowNodeData {
  const base = {
    breakpoint: false,
    executionState: 'idle' as const,
    ports: [],
  };

  switch (type) {
    case 'start':
      return {
        ...base,
        label: 'Start',
        description: 'Entry point of the workflow',
        nodeType: 'start',
        config: {},
        ports: [{ id: 'out', label: 'Output', type: 'output' }],
      };

    case 'llm':
      return {
        ...base,
        label: 'LLM Call',
        description: 'Call a language model',
        nodeType: 'llm',
        config: {
          model: 'gpt-4',
          systemPrompt: 'You are a helpful assistant.',
          temperature: 0.7,
          maxTokens: 1024,
          inputMapping: '{{input}}',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'tool':
      return {
        ...base,
        label: 'Tool Call',
        description: 'Call an external tool or API',
        nodeType: 'tool',
        config: {
          toolName: 'api_call',
          endpoint: 'https://api.example.com',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          bodyTemplate: '{"query": "{{input}}"}',
          outputMapping: 'response.data',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'branch':
      return {
        ...base,
        label: 'Branch',
        description: 'Conditional branching',
        nodeType: 'branch',
        config: {
          conditions: [
            { id: 'cond-true', label: 'True', expression: 'input.value === true', targetHandle: 'true' },
            { id: 'cond-false', label: 'False', expression: 'default', targetHandle: 'false' },
          ],
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'true', label: 'True', type: 'output' },
          { id: 'false', label: 'False', type: 'output' },
        ],
      };

    case 'loop':
      return {
        ...base,
        label: 'Loop',
        description: 'Iterate over items or repeat',
        nodeType: 'loop',
        config: {
          loopType: 'forEach',
          iteratorExpression: 'input.items',
          maxIterations: 100,
          breakCondition: '',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'body', label: 'Loop Body', type: 'output' },
          { id: 'done', label: 'Done', type: 'output' },
        ],
      };

    case 'merge':
      return {
        ...base,
        label: 'Merge',
        description: 'Merge multiple inputs',
        nodeType: 'merge',
        config: {
          strategy: 'all',
          mergeExpression: '',
        },
        ports: [
          { id: 'in-1', label: 'Input 1', type: 'input' },
          { id: 'in-2', label: 'Input 2', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'transform':
      return {
        ...base,
        label: 'Transform',
        description: 'Transform data with an expression',
        nodeType: 'transform',
        config: {
          transformExpression: 'return { ...input, transformed: true };',
          language: 'javascript',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'input':
      return {
        ...base,
        label: 'User Input',
        description: 'Receive user input',
        nodeType: 'input',
        config: {
          inputSchema: { query: 'string', context: 'string' },
          defaultValues: { query: '', context: '' },
        },
        ports: [{ id: 'out', label: 'Output', type: 'output' }],
      };

    case 'output':
      return {
        ...base,
        label: 'Output',
        description: 'Final output of the workflow',
        nodeType: 'output',
        config: {
          outputMapping: 'input',
          format: 'json',
        },
        ports: [{ id: 'in', label: 'Input', type: 'input' }],
      };

    case 'subgraph':
      return {
        ...base,
        label: 'Subgraph',
        description: 'Execute another graph',
        nodeType: 'subgraph',
        config: {
          graphId: '',
          inputMapping: {},
          outputMapping: {},
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'delay':
      return {
        ...base,
        label: 'Delay',
        description: 'Wait for a specified time',
        nodeType: 'delay',
        config: {
          delayMs: 1000,
          delayType: 'fixed',
          expression: '',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };

    case 'error-handler':
      return {
        ...base,
        label: 'Error Handler',
        description: 'Handle errors with retry and fallback',
        nodeType: 'error-handler',
        config: {
          retryCount: 3,
          retryDelayMs: 1000,
          fallbackExpression: '{ "error": "Operation failed", "fallback": true }',
          catchPattern: '*',
        },
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Success', type: 'output' },
          { id: 'error', label: 'Error', type: 'output' },
        ],
      };

    default:
      return {
        ...base,
        label: 'Unknown',
        description: '',
        nodeType: type,
        config: {},
        ports: [
          { id: 'in', label: 'Input', type: 'input' },
          { id: 'out', label: 'Output', type: 'output' },
        ],
      };
  }
}

export const NODE_PALETTE_ITEMS: NodePaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Entry point',
    icon: 'Play',
    color: '#22c55e',
    defaultData: {},
  },
  {
    type: 'llm',
    label: 'LLM Call',
    description: 'Language model invocation',
    icon: 'Brain',
    color: '#8b5cf6',
    defaultData: {},
  },
  {
    type: 'tool',
    label: 'Tool / API',
    description: 'External tool or API call',
    icon: 'Wrench',
    color: '#f59e0b',
    defaultData: {},
  },
  {
    type: 'branch',
    label: 'Branch',
    description: 'Conditional logic',
    icon: 'GitBranch',
    color: '#3b82f6',
    defaultData: {},
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Iterate over data',
    icon: 'Repeat',
    color: '#06b6d4',
    defaultData: {},
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Combine multiple paths',
    icon: 'GitMerge',
    color: '#ec4899',
    defaultData: {},
  },
  {
    type: 'transform',
    label: 'Transform',
    description: 'Data transformation',
    icon: 'Shuffle',
    color: '#14b8a6',
    defaultData: {},
  },
  {
    type: 'input',
    label: 'User Input',
    description: 'Receive user input',
    icon: 'MessageSquare',
    color: '#22c55e',
    defaultData: {},
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Final result',
    icon: 'Send',
    color: '#ef4444',
    defaultData: {},
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Timed wait',
    icon: 'Clock',
    color: '#94a3b8',
    defaultData: {},
  },
  {
    type: 'error-handler',
    label: 'Error Handler',
    description: 'Catch and handle errors',
    icon: 'ShieldAlert',
    color: '#ef4444',
    defaultData: {},
  },
  {
    type: 'subgraph',
    label: 'Subgraph',
    description: 'Nested workflow',
    icon: 'Layers',
    color: '#6366f1',
    defaultData: {},
  },
];
