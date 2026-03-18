'use client';

import React, { useState } from 'react';
import { useFlowGraphStore } from '@/lib/store';

export default function StateInspector() {
  const { nodes, selectedNodeId, updateNodeData, variables, execution } = useFlowGraphStore();
  const [editingField, setEditingField] = useState<string | null>(null);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-panel-light">
          <h2 className="text-sm font-semibold text-white">State Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted text-center px-6">
            Select a node on the canvas to inspect its state and configuration.
          </p>
        </div>
      </div>
    );
  }

  const data = selectedNode.data;
  const config = data.config as Record<string, unknown>;

  const handleConfigChange = (key: string, value: unknown) => {
    updateNodeData(selectedNode.id, {
      config: { ...config, [key]: value },
    });
    setEditingField(null);
  };

  const handleLabelChange = (label: string) => {
    updateNodeData(selectedNode.id, { label });
  };

  const handleDescriptionChange = (description: string) => {
    updateNodeData(selectedNode.id, { description });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white">State Inspector</h2>
        <p className="text-[10px] text-muted mt-0.5">Node: {data.nodeType}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Basic info */}
        <div className="px-4 py-3 border-b border-panel-light">
          <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">Label</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-white focus:outline-none focus:border-accent"
          />
          <label className="text-[10px] uppercase tracking-wider text-muted block mb-1 mt-3">Description</label>
          <input
            type="text"
            value={data.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-white focus:outline-none focus:border-accent"
          />
        </div>

        {/* Configuration */}
        <div className="px-4 py-3 border-b border-panel-light">
          <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">Configuration</h3>
          <div className="space-y-2">
            {Object.entries(config).map(([key, value]) => (
              <div key={key}>
                <label className="text-[10px] text-muted block mb-0.5">{key}</label>
                {typeof value === 'string' ? (
                  value.length > 60 ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      rows={3}
                      className="w-full px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-white focus:outline-none focus:border-accent font-mono resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-white focus:outline-none focus:border-accent font-mono"
                    />
                  )
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleConfigChange(key, parseFloat(e.target.value) || 0)}
                    step={key === 'temperature' ? 0.1 : 1}
                    className="w-full px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-white focus:outline-none focus:border-accent font-mono"
                  />
                ) : typeof value === 'boolean' ? (
                  <button
                    onClick={() => handleConfigChange(key, !value)}
                    className={`px-2 py-1 text-xs rounded ${
                      value ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {value ? 'true' : 'false'}
                  </button>
                ) : (
                  <div className="px-2 py-1 text-xs bg-panel-light border border-panel-light rounded text-muted font-mono max-h-24 overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Execution state */}
        <div className="px-4 py-3 border-b border-panel-light">
          <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">Execution State</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Status</span>
              <span className={`font-medium ${getStatusColor(data.executionState)}`}>
                {data.executionState || 'idle'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Breakpoint</span>
              <span className={data.breakpoint ? 'text-red-400' : 'text-muted'}>
                {data.breakpoint ? 'enabled' : 'disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Last output */}
        {data.lastOutput !== undefined && (
          <div className="px-4 py-3 border-b border-panel-light">
            <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">Last Output</h3>
            <pre className="text-[10px] text-green-300 bg-panel-light rounded p-2 overflow-auto max-h-40 font-mono">
              {JSON.stringify(data.lastOutput, null, 2)}
            </pre>
          </div>
        )}

        {/* Last input */}
        {data.lastInput !== undefined && (
          <div className="px-4 py-3 border-b border-panel-light">
            <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">Last Input</h3>
            <pre className="text-[10px] text-blue-300 bg-panel-light rounded p-2 overflow-auto max-h-40 font-mono">
              {JSON.stringify(data.lastInput, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="px-4 py-3 border-b border-panel-light">
            <h3 className="text-[10px] uppercase tracking-wider text-red-400 mb-2">Error</h3>
            <pre className="text-[10px] text-red-300 bg-red-500/10 rounded p-2 overflow-auto max-h-24 font-mono">
              {data.error}
            </pre>
          </div>
        )}

        {/* Variables referencing this node */}
        <div className="px-4 py-3">
          <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">Related Variables</h3>
          {Object.entries(variables)
            .filter(([k]) => k.includes(selectedNode.id))
            .map(([key, value]) => (
              <div key={key} className="mb-2">
                <div className="text-[10px] text-accent font-mono">{key}</div>
                <pre className="text-[10px] text-white/70 bg-panel-light rounded p-1.5 overflow-auto max-h-24 font-mono mt-0.5">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          {Object.keys(variables).filter((k) => k.includes(selectedNode.id)).length === 0 && (
            <p className="text-[10px] text-muted">No variables for this node yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(state?: string): string {
  switch (state) {
    case 'running': return 'text-accent-light';
    case 'completed': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'paused': return 'text-amber-400';
    case 'queued': return 'text-blue-400';
    default: return 'text-muted';
  }
}
