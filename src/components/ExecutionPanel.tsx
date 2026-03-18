'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useFlowGraphStore } from '@/lib/store';
import { createExecutor, getCurrentExecutor, clearCurrentExecutor } from '@/lib/executor';
import { ExecutionMode } from '@/lib/types';

export default function ExecutionPanel() {
  const {
    nodes,
    edges,
    variables,
    execution,
    setExecutionState,
    addLogEntry,
    updateNodeExecutionState,
    resetExecution,
    setVariable,
  } = useFlowGraphStore();

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [execution.log.length]);

  const handleRun = useCallback(async (mode: ExecutionMode) => {
    resetExecution();
    setExecutionState({
      isRunning: true,
      isPaused: false,
      mode,
      startTime: Date.now(),
    });

    const executor = createExecutor(nodes, edges, variables, {
      onNodeStart: (nodeId) => {
        updateNodeExecutionState(nodeId, 'running');
        setExecutionState({ currentNodeId: nodeId });
      },
      onNodeComplete: (nodeId, output) => {
        updateNodeExecutionState(nodeId, 'completed', output);
      },
      onNodeError: (nodeId, error) => {
        updateNodeExecutionState(nodeId, 'error', undefined, error);
      },
      onLog: (entry) => {
        addLogEntry(entry);
      },
      onVariableSet: (key, value) => {
        setVariable(key, value);
      },
      onPause: () => {
        setExecutionState({ isPaused: true });
      },
    });

    try {
      await executor.execute(mode);
      setExecutionState({
        isRunning: false,
        isPaused: false,
        currentNodeId: null,
        endTime: Date.now(),
      });
    } catch (err) {
      setExecutionState({
        isRunning: false,
        isPaused: false,
        error: err instanceof Error ? err.message : String(err),
        endTime: Date.now(),
      });
    }
  }, [nodes, edges, variables, resetExecution, setExecutionState, updateNodeExecutionState, addLogEntry, setVariable]);

  const handleStep = useCallback(() => {
    const executor = getCurrentExecutor();
    if (executor) {
      executor.step();
      setExecutionState({ isPaused: false });
    }
  }, [setExecutionState]);

  const handleResume = useCallback(() => {
    const executor = getCurrentExecutor();
    if (executor) {
      executor.resume();
      setExecutionState({ isPaused: false, mode: 'run' });
    }
  }, [setExecutionState]);

  const handleStop = useCallback(() => {
    clearCurrentExecutor();
    setExecutionState({
      isRunning: false,
      isPaused: false,
      currentNodeId: null,
      endTime: Date.now(),
    });
  }, [setExecutionState]);

  const handleReset = useCallback(() => {
    clearCurrentExecutor();
    resetExecution();
  }, [resetExecution]);

  const totalDuration = execution.log.reduce((sum, e) => sum + (e.duration || 0), 0);
  const completedCount = execution.log.filter((e) => e.status === 'completed').length;
  const errorCount = execution.log.filter((e) => e.status === 'error').length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-panel-light">
        <h2 className="text-sm font-semibold text-white">Execution</h2>
        <p className="text-[10px] text-muted mt-0.5">
          {execution.isRunning
            ? execution.isPaused
              ? 'Paused'
              : 'Running...'
            : execution.log.length > 0
            ? 'Completed'
            : 'Ready'}
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-b border-panel-light">
        <div className="flex gap-2 flex-wrap">
          {!execution.isRunning ? (
            <>
              <button
                onClick={() => handleRun('run')}
                disabled={nodes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:text-green-400/50 text-white rounded-md transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1.5l7.5 4.5-7.5 4.5V1.5z"/></svg>
                Run
              </button>
              <button
                onClick={() => handleRun('step')}
                disabled={nodes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-light disabled:bg-accent/30 disabled:text-accent-light/50 text-white rounded-md transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1.5l5 4.5-5 4.5V1.5zM8 2h2v8H8z"/></svg>
                Step
              </button>
              <button
                onClick={() => handleRun('run-to-breakpoint')}
                disabled={nodes.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/30 disabled:text-amber-400/50 text-white rounded-md transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="4"/></svg>
                To BP
              </button>
            </>
          ) : (
            <>
              {execution.isPaused && (
                <>
                  <button
                    onClick={handleStep}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-light text-white rounded-md transition-colors"
                  >
                    Step
                  </button>
                  <button
                    onClick={handleResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    Resume
                  </button>
                </>
              )}
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="2" width="8" height="8"/></svg>
                Stop
              </button>
            </>
          )}
          {execution.log.length > 0 && !execution.isRunning && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-panel-light hover:bg-panel-light/80 text-muted rounded-md transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {execution.log.length > 0 && (
        <div className="px-4 py-2 border-b border-panel-light grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] text-muted">Completed</div>
            <div className="text-sm font-semibold text-green-400">{completedCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted">Errors</div>
            <div className="text-sm font-semibold text-red-400">{errorCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted">Duration</div>
            <div className="text-sm font-semibold text-white">{totalDuration}ms</div>
          </div>
        </div>
      )}

      {/* Execution Log */}
      <div className="flex-1 overflow-y-auto" ref={logContainerRef}>
        {execution.log.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted text-center px-6">
              Click Run to execute the graph, or Step to execute one node at a time.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            {execution.log.map((entry, i) => (
              <div
                key={entry.id}
                className={`p-2.5 rounded-md border fade-in ${
                  entry.status === 'completed'
                    ? 'bg-green-500/5 border-green-500/20'
                    : entry.status === 'error'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-panel-light/50 border-panel-light'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted w-4">{i + 1}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        entry.status === 'completed'
                          ? 'bg-green-500'
                          : entry.status === 'error'
                          ? 'bg-red-500'
                          : entry.status === 'running'
                          ? 'bg-accent animate-pulse'
                          : 'bg-muted'
                      }`}
                    />
                    <span className="text-xs font-medium text-white">{entry.nodeLabel}</span>
                    <span className="text-[10px] text-muted">{entry.nodeType}</span>
                  </div>
                  {entry.duration !== undefined && (
                    <span className="text-[10px] text-muted">{entry.duration}ms</span>
                  )}
                </div>
                {entry.error && (
                  <div className="mt-1.5 text-[10px] text-red-400 font-mono bg-red-500/10 rounded px-2 py-1">
                    {entry.error}
                  </div>
                )}
                {entry.output && entry.status === 'completed' && (
                  <details className="mt-1.5">
                    <summary className="text-[10px] text-muted cursor-pointer hover:text-white">
                      View output
                    </summary>
                    <pre className="mt-1 text-[10px] text-green-300/80 bg-panel-light rounded p-2 overflow-auto max-h-24 font-mono">
                      {JSON.stringify(entry.output, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {execution.error && (
        <div className="px-4 py-2 border-t border-red-500/30 bg-red-500/10">
          <p className="text-xs text-red-400">{execution.error}</p>
        </div>
      )}
    </div>
  );
}
