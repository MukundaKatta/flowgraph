# FlowGraph

> Visual State Machine and Dataflow Graph Editor

FlowGraph is an interactive node-based editor for building state machines and dataflow graphs. Connect nodes on a canvas, inspect state, execute flows, debug with breakpoints, and export as code or JSON.

## Features

- **Graph Editor** -- ReactFlow-powered canvas for creating and connecting nodes
- **Node Palette** -- Drag-and-drop node types for logic, data, I/O, and control flow
- **State Inspector** -- Real-time view of node states and data flowing through edges
- **Execution Engine** -- Step-through or continuous execution of dataflow graphs
- **Template Gallery** -- Pre-built graph templates for common patterns
- **Code Export** -- Generate code from visual graphs with syntax highlighting (Prism.js)
- **Debug Panel** -- Breakpoints, step execution, and variable inspection
- **Import/Export** -- Save and load graphs as JSON files

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Flow Editor:** ReactFlow (core, background, controls, minimap)
- **Database:** Supabase (PostgreSQL)
- **Syntax Highlighting:** Prism.js
- **State Management:** Zustand
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SUPABASE_URL and SUPABASE_ANON_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx              # Main workspace with toolbar, sidebar, and canvas
  components/
    GraphEditor.tsx       # ReactFlow canvas with node rendering
    NodePalette.tsx       # Draggable node type catalog
    StateInspector.tsx    # Node state viewer
    ExecutionPanel.tsx    # Run and step controls
    TemplateGallery.tsx   # Pre-built graph templates
    CodeExport.tsx        # Code generation with syntax highlighting
    DebugPanel.tsx        # Breakpoints and variable inspection
  lib/
    store.ts              # Zustand state with graph serialization
```

