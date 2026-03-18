'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function StartNode({ data, selected }: NodeProps<BaseNodeData>) {
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[140px] shadow-lg transition-all ${
        selected ? 'border-accent ring-2 ring-accent/30' : 'border-green-500/50'
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#1a2e1a', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(34,197,94,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="font-semibold text-green-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!bg-green-500 !border-green-700"
      />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#6366f1';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    case 'paused': return '#f59e0b';
    default: return undefined;
  }
}
