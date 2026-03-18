'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { BaseNodeData, BranchCondition } from '@/lib/types';

export default function BranchNode({ data, selected }: NodeProps<BaseNodeData>) {
  const config = data.config as { conditions?: BranchCondition[] };
  const conditions = config.conditions || [];
  const stateColor = getStateColor(data.executionState);

  return (
    <div
      className={`relative rounded-lg border-2 px-4 py-3 min-w-[160px] shadow-lg transition-all ${
        selected ? 'ring-2 ring-accent/30' : ''
      } ${data.executionState === 'running' ? 'node-executing' : ''}`}
      style={{
        background: '#1a1e2e',
        borderColor: stateColor || (selected ? '#6366f1' : 'rgba(59,130,246,0.5)'),
        clipPath: 'none',
      }}
    >
      {data.breakpoint && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-canvas" />
      )}
      <Handle type="target" position={Position.Left} id="in" className="!bg-blue-500 !border-blue-700" />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        <span className="font-semibold text-blue-400 text-sm">{data.label}</span>
      </div>
      <p className="text-xs text-muted mt-1">{data.description}</p>
      <div className="mt-2 space-y-1">
        {conditions.map((cond, i) => (
          <div key={cond.id || i} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-300/80 rounded flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${cond.expression === 'default' ? 'bg-amber-400' : 'bg-green-400'}`} />
            {cond.label}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '35%' }}
        className="!bg-green-500 !border-green-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '65%' }}
        className="!bg-amber-500 !border-amber-700"
      />
    </div>
  );
}

function getStateColor(state?: string): string | undefined {
  switch (state) {
    case 'running': return '#3b82f6';
    case 'completed': return '#22c55e';
    case 'error': return '#ef4444';
    default: return undefined;
  }
}
