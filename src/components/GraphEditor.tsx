'use client';

import React, { useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFlowGraphStore } from '@/lib/store';
import { DragData, FlowNodeType } from '@/lib/types';
import {
  StartNode,
  LLMNode,
  ToolNode,
  BranchNode,
  LoopNode,
  MergeNode,
  TransformNode,
  InputNode,
  OutputNode,
  DelayNode,
  ErrorHandlerNode,
  SubgraphNode,
} from './nodes';

const customNodeTypes: NodeTypes = {
  'custom-start': StartNode,
  'custom-llm': LLMNode,
  'custom-tool': ToolNode,
  'custom-branch': BranchNode,
  'custom-loop': LoopNode,
  'custom-merge': MergeNode,
  'custom-transform': TransformNode,
  'custom-input': InputNode,
  'custom-output': OutputNode,
  'custom-delay': DelayNode,
  'custom-error-handler': ErrorHandlerNode,
  'custom-subgraph': SubgraphNode,
};

function GraphEditorInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    removeNode,
    duplicateNode,
    toggleBreakpoint,
  } = useFlowGraphStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData('application/flowgraph-node');
      if (!raw || !reactFlowInstance.current || !reactFlowWrapper.current) return;

      const dragData: DragData = JSON.parse(raw);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(dragData.nodeType as FlowNodeType, position);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      // Simple context menu via prompt — in production you'd use a custom context menu
      const action = window.prompt(
        `Node: ${node.id}\nActions:\n1 - Toggle Breakpoint\n2 - Duplicate\n3 - Delete\n\nEnter number:`,
        '1'
      );
      switch (action) {
        case '1':
          toggleBreakpoint(node.id);
          break;
        case '2':
          duplicateNode(node.id);
          break;
        case '3':
          removeNode(node.id);
          break;
      }
    },
    [toggleBreakpoint, duplicateNode, removeNode]
  );

  const minimapStyle = useMemo(
    () => ({
      height: 100,
      maskColor: 'rgba(15, 15, 35, 0.8)',
    }),
    []
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={customNodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1e1e3a" />
        <Controls className="!bg-panel !border-panel-light" />
        <MiniMap
          style={minimapStyle}
          nodeColor={(n) => {
            const type = n.data?.nodeType;
            switch (type) {
              case 'start': return '#22c55e';
              case 'llm': return '#8b5cf6';
              case 'tool': return '#f59e0b';
              case 'branch': return '#3b82f6';
              case 'loop': return '#06b6d4';
              case 'merge': return '#ec4899';
              case 'transform': return '#14b8a6';
              case 'input': return '#22c55e';
              case 'output': return '#ef4444';
              case 'delay': return '#94a3b8';
              case 'error-handler': return '#ef4444';
              default: return '#6366f1';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function GraphEditor() {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
}
