'use client';

import React, { useState } from 'react';
import { NODE_PALETTE_ITEMS } from '@/lib/node-defaults';
import { FlowNodeType, DragData } from '@/lib/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Play: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6V2z"/></svg>,
  Brain: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5 8c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3"/></svg>,
  Wrench: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2a4 4 0 0 0-3.5 5.9L3 11.4 4.6 13l3.5-3.5A4 4 0 1 0 10 2z"/></svg>,
  GitBranch: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="4" r="2"/><circle cx="11" cy="6" r="2"/><circle cx="5" cy="12" r="2"/><path d="M5 6v4M5 6c2 0 4 0 6 0"/></svg>,
  Repeat: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a6 6 0 1 1-4 1.5"/><path d="M4 1v3h3"/></svg>,
  GitMerge: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="4" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="11" cy="10" r="2"/><path d="M5 6v4M5 6c3 0 6 4 6 4"/></svg>,
  Shuffle: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h4l4 8h4M2 12h4l4-8h4M13 3l2 1-2 1M13 11l2 1-2 1"/></svg>,
  MessageSquare: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="9" rx="2"/><path d="M6 11v3l3-3"/></svg>,
  Send: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2L2 7l5 2 2 5z"/></svg>,
  Clock: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 3"/></svg>,
  ShieldAlert: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L2 4v4c0 4 6 7 6 7s6-3 6-7V4L8 1z"/><path d="M8 6v3M8 11h0"/></svg>,
  Layers: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2l6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3"/></svg>,
};

export default function NodePalette() {
  const [search, setSearch] = useState('');

  const filtered = NODE_PALETTE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (e: React.DragEvent, type: FlowNodeType, label: string) => {
    const data: DragData = { nodeType: type, label };
    e.dataTransfer.setData('application/flowgraph-node', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white mb-2">Node Palette</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nodes..."
          className="w-full px-3 py-1.5 text-xs bg-panel-light border border-panel-light rounded-md text-white placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type, item.label)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-panel-light/50 hover:bg-panel-light border border-transparent hover:border-accent/30 cursor-grab active:cursor-grabbing transition-all group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, color: item.color }}
            >
              {ICON_MAP[item.icon] || <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white group-hover:text-accent-light transition-colors">
                {item.label}
              </div>
              <div className="text-[10px] text-muted truncate">{item.description}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-muted text-center py-8">No matching nodes found</div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-panel-light">
        <p className="text-[10px] text-muted">Drag nodes onto the canvas to build your workflow</p>
      </div>
    </div>
  );
}
