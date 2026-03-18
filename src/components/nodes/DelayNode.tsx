'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function DelayNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { delayMs?: number };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[140px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#1e1e2e', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(148,163,184,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-slate-400 !border-slate-600" />
      <div className="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-400">
          <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="3" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="6" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="font-semibold text-slate-300 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <span className="text-[10px] px-1.5 py-0.5 bg-slate-500/20 text-slate-300 rounded mt-2 inline-block">
        {config.delayMs || 1000}ms
      </span>
      <Handle type="source" position={Position.Right} id="out" className="!bg-slate-400 !border-slate-600" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#94a3b8';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
