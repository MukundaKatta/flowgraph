'use client';

import React, { useCallback } from 'react';
import { useFlowGraphStore } from '@/lib/store';
import GraphEditor from '@/components/GraphEditor';
import NodePalette from '@/components/NodePalette';
import StateInspector from '@/components/StateInspector';
import ExecutionPanel from '@/components/ExecutionPanel';
import TemplateGallery from '@/components/TemplateGallery';
import CodeExport from '@/components/CodeExport';
import DebugPanel from '@/components/DebugPanel';

type PanelType = 'palette' | 'inspector' | 'execution' | 'templates' | 'code' | 'debug';

const PANEL_TABS: { key: PanelType; label: string; icon: React.ReactNode }[] = [
  {
    key: 'palette',
    label: 'Nodes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    key: 'inspector',
    label: 'Inspector',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v6M5 8h6" />
      </svg>
    ),
  },
  {
    key: 'execution',
    label: 'Execute',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 2l10 6-10 6V2z" />
      </svg>
    ),
  },
  {
    key: 'templates',
    label: 'Templates',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <path d="M2 6h12M6 6v8" />
      </svg>
    ),
  },
  {
    key: 'code',
    label: 'Code',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12" />
      </svg>
    ),
  },
  {
    key: 'debug',
    label: 'Debug',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="9" r="5" />
        <path d="M8 4V2M3 7H1M15 7h-2M3 12l-1 1M13 12l1 1M8 7v3l2 1" />
      </svg>
    ),
  },
];

function PanelContent({ panel }: { panel: PanelType }) {
  switch (panel) {
    case 'palette':
      return <NodePalette />;
    case 'inspector':
      return <StateInspector />;
    case 'execution':
      return <ExecutionPanel />;
    case 'templates':
      return <TemplateGallery />;
    case 'code':
      return <CodeExport />;
    case 'debug':
      return <DebugPanel />;
    default:
      return null;
  }
}

export default function HomePage() {
  const {
    graphName,
    setGraphName,
    activePanel,
    setActivePanel,
    nodes,
    edges,
    execution,
    isDirty,
    toJSON,
    fromJSON,
    clearGraph,
  } = useFlowGraphStore();

  const handleExportJSON = useCallback(() => {
    const json = toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graphName.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toJSON, graphName]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          fromJSON(ev.target?.result as string);
        } catch (err) {
          alert('Failed to import graph: invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [fromJSON]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top bar */}
      <header className="h-12 bg-panel border-b border-panel-light flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-accent">
              <circle cx="4" cy="10" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="16" cy="5" r="3" fill="currentColor" opacity="0.8" />
              <circle cx="16" cy="15" r="3" fill="currentColor" />
              <line x1="7" y1="10" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="7" y1="10" x2="13" y2="15" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            </svg>
            <span className="font-bold text-sm text-white">FlowGraph</span>
          </div>
          <div className="w-px h-5 bg-panel-light" />
          <input
            type="text"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
            className="bg-transparent text-sm text-white/80 hover:text-white focus:text-white border-none outline-none px-1 py-0.5 rounded hover:bg-panel-light/50 focus:bg-panel-light transition-colors max-w-[200px]"
          />
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <span>{nodes.length} nodes</span>
            <span className="text-panel-light">|</span>
            <span>{edges.length} edges</span>
            {execution.isRunning && (
              <>
                <span className="text-panel-light">|</span>
                <span className="text-accent animate-pulse">Running</span>
              </>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleImportJSON}
              className="px-2.5 py-1 text-[10px] font-medium text-muted hover:text-white bg-panel-light hover:bg-panel-light/80 rounded transition-colors"
            >
              Import
            </button>
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 text-[10px] font-medium text-muted hover:text-white bg-panel-light hover:bg-panel-light/80 rounded transition-colors"
            >
              Export
            </button>
            <button
              onClick={clearGraph}
              className="px-2.5 py-1 text-[10px] font-medium text-muted hover:text-red-400 bg-panel-light hover:bg-red-500/10 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - tabs */}
        <nav className="w-12 bg-panel border-r border-panel-light flex flex-col items-center py-2 gap-1 flex-shrink-0">
          {PANEL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePanel(tab.key)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
                activePanel === tab.key
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted hover:text-white hover:bg-panel-light'
              }`}
              title={tab.label}
            >
              {tab.icon}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 text-[10px] bg-panel-light text-white rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Side panel */}
        <aside className="w-72 bg-panel border-r border-panel-light flex-shrink-0 overflow-hidden">
          <PanelContent panel={activePanel} />
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative">
          <GraphEditor />
        </main>
      </div>
    </div>
  );
}
