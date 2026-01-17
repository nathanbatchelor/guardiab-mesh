'use client';

import { useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  content: string;
  isScam?: boolean;
  confidence?: number;
}

interface AgentFeedProps {
  title: string;
  logs: LogEntry[];
  accentColor: 'blue' | 'purple' | 'cyan' | 'green' | 'red';
  emptyMessage?: string;
}

const colorClasses = {
  blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', accent: 'bg-blue-500' },
  purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', accent: 'bg-purple-500' },
  cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400', accent: 'bg-cyan-500' },
  green: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400', accent: 'bg-green-500' },
  red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', accent: 'bg-red-500' },
};

export default function AgentFeed({ title, logs, accentColor, emptyMessage = 'Waiting for data...' }: AgentFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const colors = colorClasses[accentColor];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`flex-1 rounded-xl border ${colors.border} bg-guardian-panel/50 backdrop-blur-sm overflow-hidden flex flex-col`}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`p-3 rounded-lg border ${log.isScam ? 'border-red-500/50 bg-red-500/10' : `${colors.border} ${colors.bg}`}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                {log.confidence !== undefined && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${log.isScam ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {log.confidence}%
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200">{log.content}</p>
              {log.isScam && <div className="mt-2 text-xs text-red-400 font-semibold">⚠️ POTENTIAL SCAM</div>}
            </div>
          ))
        )}
      </div>
      <div className={`px-4 py-2 border-t ${colors.border} bg-guardian-dark/50 flex justify-between text-xs text-slate-500`}>
        <span>{logs.length} entries</span>
        <span className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${colors.accent} animate-pulse`} />Live</span>
      </div>
    </div>
  );
}
