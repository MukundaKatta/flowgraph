'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData } from '@/lib/types';

export default function InputNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { inputSchema?: Record<string, string> };
  const fields = Object.keys(config.inputSchema || {});
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[160px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{ background: '#1a2e1a', borderColor: stateColor || (selected ? '#6366f1' : 'rgba(34,197,94,0.5)') }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded border-2 border-green-500 bg-transparent" />
        <span className="font-semibold text-green-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      {fields.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {fields.slice(0, 3).map((f) => (
            <div key={f} className="text-[10px] text-green-300/70">{f}: {config.inputSchema![f]}</div>
          ))}
          {fields.length > 3 && <div className="text-[10px] text-muted">+{fields.length - 3} more</div>}
        </div>
      )}
      <Handle type="source" position={Position.Right} id="out" className="!bg-green-500 !border-green-700" />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#22c55e';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
