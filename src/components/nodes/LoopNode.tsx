'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function LoopNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { loopType?: string; maxIterations?: number };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[160px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#1a2a2e', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(6,182,212,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-cyan-500 !border-cyan-700" />
      <div className="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-cyan-500">
          <path d="M6 1a5 5 0 1 1-3 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 0v3h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="font-semibold text-cyan-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <div className="flex gap-2 mt-2">
        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
          {config.loopType || 'forEach'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300/70 rounded">
          max: {config.maxIterations || 100}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="body"
        style={{ top: '35%' }}
        className="!bg-cyan-500 !border-cyan-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="done"
        style={{ top: '70%' }}
        className="!bg-green-500 !border-green-700"
      />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#06b6d4';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
