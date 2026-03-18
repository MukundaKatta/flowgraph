'use client';

import React, { useState } from 'react';
import { useFlowGraphStore } from '@/lib/store';
import { GRAPH_TEMPLATES } from '@/lib/templates';

const CATEGORY_COLORS: Record<string, string> = {
  Basics: '#22c55e',
  Advanced: '#8b5cf6',
  Agents: '#3b82f6',
  Data: '#f59e0b',
};

export default function TemplateGallery() {
  const { loadTemplate } = useFlowGraphStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const categories = Array.from(new Set(GRAPH_TEMPLATES.map((t) => t.category)));
  const filtered = selectedCategory
    ? GRAPH_TEMPLATES.filter((t) => t.category === selectedCategory)
    : GRAPH_TEMPLATES;

  const handleLoad = (templateId: string) => {
    if (confirmId === templateId) {
      const template = GRAPH_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        loadTemplate(template);
      }
      setConfirmId(null);
    } else {
      setConfirmId(templateId);
      setTimeout(() => setConfirmId(null), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white">Templates</h2>
        <p className="text-[10px] text-muted mt-0.5">Pre-built workflow templates</p>
      </div>

      {/* Category filter */}
      <div className="px-4 py-2 border-b border-panel-light flex gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
            !selectedCategory ? 'bg-accent text-white' : 'bg-panel-light text-muted hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
              selectedCategory === cat ? 'bg-accent text-white' : 'bg-panel-light text-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-panel-light bg-panel-light/30 hover:bg-panel-light/60 transition-colors overflow-hidden"
          >
            {/* Template header */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-semibold text-white">{template.name}</h3>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: `${CATEGORY_COLORS[template.category] || '#6366f1'}20`,
                    color: CATEGORY_COLORS[template.category] || '#6366f1',
                  }}
                >
                  {template.category}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">{template.description}</p>

              {/* Stats */}
              <div className="flex gap-3 mt-2.5">
                <span className="text-[10px] text-muted">
                  {template.nodes.length} nodes
                </span>
                <span className="text-[10px] text-muted">
                  {template.edges.length} connections
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {template.tags.map((tag) => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-panel-light rounded text-muted">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Load button */}
              <button
                onClick={() => handleLoad(template.id)}
                className={`mt-3 w-full py-1.5 text-xs font-medium rounded-md transition-colors ${
                  confirmId === template.id
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-accent/20 hover:bg-accent/30 text-accent-light'
                }`}
              >
                {confirmId === template.id ? 'Click again to confirm (replaces current graph)' : 'Load Template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
