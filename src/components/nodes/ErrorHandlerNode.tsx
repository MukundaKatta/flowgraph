'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function ErrorHandlerNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { retryCount?: number };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[160px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#2e1a1e', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(239,68,68,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-red-500 !border-red-700" />
      <div className="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-red-400">
          <path d="M6 1L11 10H1L6 1Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="4.5" x2="6" y2="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
        </svg>
        <span className="font-semibold text-red-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded mt-2 inline-block">
        retry: {config.retryCount || 3}x
      </span>
      <Handle type="source" position={Position.Right} id="out" style={{ top: '35%' }} className="!bg-green-500 !border-green-700" />
      <Handle type="source" position={Position.Right} id="error" style={{ top: '65%' }} className="!bg-red-500 !border-red-700" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#ef4444';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
