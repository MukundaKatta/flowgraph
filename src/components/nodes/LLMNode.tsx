'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function LLMNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { model?: string; temperature?: number };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[180px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#1e1a2e', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(139,92,246,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-purple-500 !border-purple-700" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-purple-500" />
        <span className="font-semibold text-purple-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <div className="flex gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
          {config.model || 'gpt-4'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-300/70 rounded">
          t={config.temperature ?? 0.7}
        </span>
      </div>
      {data.executionState === 'completed' && data.lastOutput && (
        <div className="mt-2 text-[10px] text-green-400 truncate max-w-[200px]">
          Output available
        </div>
      )}
      {data.error && (
        <div className="mt-2 text-[10px] text-red-400 truncate max-w-[200px]">
          {data.error}
        </div>
      )}
      <Handle type="source" position={Position.Right} id="out" className="!bg-purple-500 !border-purple-700" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#8b5cf6';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    case 'paused': return '#f59e0b';
    default: return undefined;
  }
}
