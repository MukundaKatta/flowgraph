'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function ToolNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { toolName?: string; method?: string };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[180px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#2e2a1a', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(245,158,11,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-amber-500 !border-amber-700" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="font-semibold text-amber-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <div className="flex gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">
          {config.toolName || 'api'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300/70 rounded">
          {config.method || 'POST'}
        </span>
      </div>
      {data.error && (
        <div className="mt-2 text-[10px] text-red-400 truncate max-w-[200px]">{data.error}</div>
      )}
      <Handle type="source" position={Position.Right} id="out" className="!bg-amber-500 !border-amber-700" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#f59e0b';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    case 'paused': return '#f59e0b';
    default: return undefined;
  }
}
