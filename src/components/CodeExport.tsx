'use client';

import React, { useMemo, useState } from 'react';
import { useFlowGraphStore } from '@/lib/store';
import { generateCode } from '@/lib/code-generator';
import { CodeLanguage } from '@/lib/types';

export default function CodeExport() {
  const { nodes, edges, graphName, codeLanguage, setCodeLanguage } = useFlowGraphStore();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    if (nodes.length === 0) return '';
    return generateCode(nodes, edges, codeLanguage, graphName);
  }, [nodes, edges, codeLanguage, graphName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const ext = codeLanguage === 'python' ? 'py' : 'ts';
    const filename = `${graphName.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white">Code Export</h2>
        <p className="text-[10px] text-muted mt-0.5">Generate executable code from your graph</p>
      </div>

      {/* Language selector */}
      <div className="px-4 py-2 border-b border-panel-light flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['python', 'typescript'] as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setCodeLanguage(lang)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                codeLanguage === lang
                  ? 'bg-accent text-white'
                  : 'bg-panel-light text-muted hover:text-white'
              }`}
            >
              {lang === 'python' ? 'Python' : 'TypeScript'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            disabled={!code}
            className="px-2 py-1 text-[10px] bg-panel-light hover:bg-panel-light/80 text-muted hover:text-white rounded transition-colors disabled:opacity-30"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!code}
            className="px-2 py-1 text-[10px] bg-panel-light hover:bg-panel-light/80 text-muted hover:text-white rounded transition-colors disabled:opacity-30"
          >
            Download
          </button>
        </div>
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto">
        {code ? (
          <pre className="p-4 text-[11px] leading-relaxed font-mono text-slate-300 whitespace-pre">
            {highlightCode(code, codeLanguage)}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted text-center px-6">
              Add nodes to your graph to generate code.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {code && (
        <div className="px-4 py-2 border-t border-panel-light flex items-center justify-between">
          <span className="text-[10px] text-muted">
            {code.split('\n').length} lines
          </span>
          <span className="text-[10px] text-muted">
            {nodes.length} nodes exported
          </span>
        </div>
      )}
    </div>
  );
}

function highlightCode(code: string, lang: CodeLanguage): React.ReactNode {
  // Simple syntax highlighting
  const lines = code.split('\n');

  return lines.map((line, i) => {
    let highlighted = line;

    // Comments
    if (lang === 'python' && (line.trimStart().startsWith('#') || line.trimStart().startsWith('"""'))) {
      return <div key={i} className="text-slate-500">{line}</div>;
    }
    if (lang === 'typescript' && (line.trimStart().startsWith('//') || line.trimStart().startsWith('/*') || line.trimStart().startsWith('*'))) {
      return <div key={i} className="text-slate-500">{line}</div>;
    }

    // Keywords
    const pyKeywords = /\b(def|async|await|class|import|from|return|if|elif|else|for|while|try|except|raise|with|as|in|not|and|or|True|False|None)\b/g;
    const tsKeywords = /\b(function|async|await|const|let|var|return|if|else|for|while|try|catch|throw|new|import|export|interface|type|class|extends|implements)\b/g;

    const keywordRegex = lang === 'python' ? pyKeywords : tsKeywords;
    const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
    const typeRegex = lang === 'typescript' ? /\b(string|number|boolean|unknown|any|void|Promise|Record|Array|Dict|Optional)\b/g : /\b(str|int|float|bool|list|dict|Any|Dict|Optional)\b/g;

    // Build spans - simplified approach
    const isImportLine = line.trimStart().startsWith('import') || line.trimStart().startsWith('from');
    const isDefLine = line.trimStart().startsWith('def ') || line.trimStart().startsWith('async def') || line.trimStart().startsWith('async function') || line.trimStart().startsWith('function');

    if (isImportLine) {
      return <div key={i} className="text-purple-400">{line}</div>;
    }

    if (isDefLine) {
      return <div key={i} className="text-blue-400">{line}</div>;
    }

    return <div key={i}>{line}</div>;
  });
}
