'use client';

import React, { useState } from 'react';
import { useFlowGraphStore } from '@/lib/store';

export default function DebugPanel() {
  const { nodes, edges, variables, execution, toggleBreakpoint, selectNode, setActivePanel } = useFlowGraphStore();
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [variableFilter, setVariableFilter] = useState('');

  const breakpointNodes = nodes.filter((n) => n.data.breakpoint);

  const filteredVariables = Object.entries(variables).filter(([key]) =>
    key.toLowerCase().includes(variableFilter.toLowerCase())
  );

  const handleNodeClick = (nodeId: string) => {
    selectNode(nodeId);
    setActivePanel('inspector');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white">Debug</h2>
        <p className="text-[10px] text-muted mt-0.5">Breakpoints, variables, and I/O inspection</p>
      </div>

      {/* Breakpoints section */}
      <div className="px-4 py-3 border-b border-panel-light">
        <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Breakpoints ({breakpointNodes.length})
        </h3>
        {breakpointNodes.length === 0 ? (
          <p className="text-[10px] text-muted">
            No breakpoints set. Right-click a node or use the inspector to add breakpoints.
          </p>
        ) : (
          <div className="space-y-1">
            {breakpointNodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between px-2 py-1.5 bg-red-500/5 border border-red-500/20 rounded"
              >
                <button
                  onClick={() => handleNodeClick(node.id)}
                  className="text-xs text-red-300 hover:text-red-200 transition-colors text-left"
                >
                  {node.data.label}
                  <span className="text-[10px] text-muted ml-1.5">{node.data.nodeType}</span>
                </button>
                <button
                  onClick={() => toggleBreakpoint(node.id)}
                  className="text-[10px] text-muted hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Nodes I/O */}
      <div className="px-4 py-3 border-b border-panel-light">
        <h3 className="text-[10px] uppercase tracking-wider text-muted mb-2">
          Node I/O ({nodes.length} nodes)
        </h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {nodes.map((node) => (
            <div key={node.id} className="rounded border border-panel-light overflow-hidden">
              <button
                onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs hover:bg-panel-light/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.data.executionState === 'completed'
                        ? 'bg-green-500'
                        : node.data.executionState === 'error'
                        ? 'bg-red-500'
                        : node.data.executionState === 'running'
                        ? 'bg-accent animate-pulse'
                        : 'bg-muted/30'
                    }`}
                  />
                  <span className="text-white">{node.data.label}</span>
                </div>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className={`text-muted transition-transform ${expandedNode === node.id ? 'rotate-90' : ''}`}
                >
                  <path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              {expandedNode === node.id && (
                <div className="px-2 pb-2 space-y-1.5 fade-in">
                  {/* Input */}
                  <div>
                    <div className="text-[9px] uppercase text-blue-400 mb-0.5">Input</div>
                    <pre className="text-[10px] text-blue-300/70 bg-blue-500/5 rounded p-1.5 overflow-auto max-h-16 font-mono">
                      {node.data.lastInput !== undefined
                        ? JSON.stringify(node.data.lastInput, null, 2)
                        : 'No input recorded'}
                    </pre>
                  </div>
                  {/* Output */}
                  <div>
                    <div className="text-[9px] uppercase text-green-400 mb-0.5">Output</div>
                    <pre className="text-[10px] text-green-300/70 bg-green-500/5 rounded p-1.5 overflow-auto max-h-16 font-mono">
                      {node.data.lastOutput !== undefined
                        ? JSON.stringify(node.data.lastOutput, null, 2)
                        : 'No output recorded'}
                    </pre>
                  </div>
                  {/* Error */}
                  {node.data.error && (
                    <div>
                      <div className="text-[9px] uppercase text-red-400 mb-0.5">Error</div>
                      <pre className="text-[10px] text-red-300/70 bg-red-500/5 rounded p-1.5 overflow-auto max-h-16 font-mono">
                        {node.data.error}
                      </pre>
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => handleNodeClick(node.id)}
                      className="text-[10px] text-accent hover:text-accent-light transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => toggleBreakpoint(node.id)}
                      className={`text-[10px] transition-colors ${
                        node.data.breakpoint ? 'text-red-400 hover:text-red-300' : 'text-muted hover:text-red-400'
                      }`}
                    >
                      {node.data.breakpoint ? 'Remove BP' : 'Set BP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Variables */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] uppercase tracking-wider text-muted">
            Variables ({Object.keys(variables).length})
          </h3>
        </div>
        <input
          type="text"
          value={variableFilter}
          onChange={(e) => setVariableFilter(e.target.value)}
          placeholder="Filter variables..."
          className="w-full px-2 py-1 text-[10px] bg-panel-light border border-panel-light rounded text-white placeholder:text-muted focus:outline-none focus:border-accent mb-2"
        />
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredVariables.length === 0 ? (
            <p className="text-[10px] text-muted">
              {Object.keys(variables).length === 0
                ? 'No variables set yet. Run the graph to populate variables.'
                : 'No matching variables'}
            </p>
          ) : (
            filteredVariables.map(([key, value]) => (
              <div key={key} className="rounded border border-panel-light p-1.5">
                <div className="text-[10px] font-mono text-accent truncate">{key}</div>
                <pre className="text-[9px] text-white/60 font-mono mt-0.5 max-h-12 overflow-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
