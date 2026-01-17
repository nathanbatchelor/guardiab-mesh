'use client';

import { useState, useCallback, useRef } from 'react';
import PhoneListener from './components/PhoneListener';
import AgentFeed from './components/AgentFeed';
import AlertBanner from './components/AlertBanner';

interface AnalysisEntry {
  id: string;
  timestamp: string;
  content: string;
  isScam?: boolean;
  confidence?: number;
}

export default function Dashboard() {
  const [isScamDetected, setIsScamDetected] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'secure' | 'warning' | 'danger'>('secure');
  
  // Log States
  const [transcriptLogs, setTranscriptLogs] = useState<AnalysisEntry[]>([]);
  const [geminiLogs, setGeminiLogs] = useState<AnalysisEntry[]>([]);
  const [deepseekLogs, setDeepseekLogs] = useState<AnalysisEntry[]>([]);
  
  // Real-time Speech States (Moved to Top Level)
  const [activeSentence, setActiveSentence] = useState("");
  const lastLoggedIndex = useRef(0);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle incoming transcript from PhoneListener
  const handleTranscript = useCallback((transcript: string) => {
    // 1. Calculate the "new" part of the transcript (since last log)
    const newContent = transcript.slice(lastLoggedIndex.current).trim();
    
    // 2. Update the UI immediately (The "Speaking Now" view)
    setActiveSentence(newContent);

    // 3. Debounce Logic: If user pauses for 1000ms, commit the sentence
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    
    silenceTimer.current = setTimeout(() => {
      if (newContent.length > 0) {
        // A. Commit to historical log
        setTranscriptLogs((prev) => [
          ...prev,
          {
            id: `transcript-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content: newContent,
          },
        ]);
        
        // B. Move cursor forward
        lastLoggedIndex.current = transcript.length;
        setActiveSentence(""); // Clear active buffer
      }
    }, 1000); // 1.0s silence = end of sentence
  }, []);

  const statusConfig = {
    secure: {
      text: 'System: SECURE',
      color: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
    },
    warning: {
      text: 'System: ANALYZING',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
    },
    danger: {
      text: 'System: SCAM DETECTED',
      color: 'bg-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-600',
    },
  };

  const currentStatus = statusConfig[systemStatus];

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Alert Banner - Hidden until scam detected */}
      <AlertBanner isScam={isScamDetected} />

      {/* Header / Status Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/20">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Guardian Mesh</h1>
                <p className="text-sm text-slate-400">AI-Powered Scam Detection</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${currentStatus.borderColor} bg-slate-900`}>
              <span className={`w-3 h-3 rounded-full ${currentStatus.color} animate-pulse shadow-[0_0_10px_currentColor]`} />
              <span className={`font-mono text-sm font-semibold ${currentStatus.textColor}`}>
                {currentStatus.text}
              </span>
            </div>

            {/* Phone Listener Component */}
            <PhoneListener onTranscript={handleTranscript} />
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Column: Live Transcript */}
          <div className="flex flex-col h-full bg-slate-900/30 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="font-semibold text-lg text-blue-100">Live Transcript</h2>
            </div>
            
            {/* 1. Historical Log */}
            <div className="flex-1 min-h-0 mb-4">
              <AgentFeed
                title="Call History"
                logs={transcriptLogs}
                accentColor="blue"
                emptyMessage="Waiting for audio..."
              />
            </div>

            {/* 2. Active Buffer (Visualizing current speech) */}
            <div className={`p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 transition-opacity duration-300 ${activeSentence ? 'opacity-100' : 'opacity-0'}`}>
                <p className="font-mono text-sm text-blue-200">
                  <span className="text-blue-400 text-xs uppercase tracking-wider mr-2 font-bold">Speaking:</span>
                  {activeSentence}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"/>
                </p>
            </div>
          </div>

          {/* Middle Column: Gemini Analysis */}
          <div className="flex flex-col h-full bg-slate-900/30 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="font-semibold text-lg text-purple-100">Gemini 3.0</h2>
              <span className="text-xs text-slate-500 ml-auto font-mono">AGENT A</span>
            </div>
            <AgentFeed
              title="Threat Detection"
              logs={geminiLogs}
              accentColor="purple"
              emptyMessage="Gemini agent active..."
            />
          </div>

          {/* Right Column: DeepSeek Analysis */}
          <div className="flex flex-col h-full bg-slate-900/30 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="font-semibold text-lg text-cyan-100">DeepSeek R1</h2>
              <span className="text-xs text-slate-500 ml-auto font-mono">AGENT B</span>
            </div>
            <AgentFeed
              title="Psych Analysis"
              logs={deepseekLogs}
              accentColor="cyan"
              emptyMessage="DeepSeek agent active..."
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 bg-slate-950">
        <div className="container mx-auto px-6 text-center text-xs text-slate-600 font-mono">
          GUARDIAN MESH v1.0 • SECURING THE VULNERABLE
        </div>
      </footer>
    </main>
  );
}