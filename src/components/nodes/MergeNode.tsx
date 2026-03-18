'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function MergeNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { strategy?: string };
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[140px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#2e1a2a', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(236,72,153,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in-1" style={{ top: '35%' }} className="!bg-pink-500 !border-pink-700" />
      <Handle type="target" position={Position.Left} id="in-2" style={{ top: '65%' }} className="!bg-pink-500 !border-pink-700" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-pink-500" />
        <span className="font-semibold text-pink-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <span className="text-[10px] px-1.5 py-0.5 bg-pink-500/20 text-pink-300 rounded mt-2 inline-block">
        {config.strategy || 'all'}
      </span>
      <Handle type="source" position={Position.Right} id="out" className="!bg-pink-500 !border-pink-700" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#ec4899';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
