'use client';

import { useEffect, useState, useRef } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface PhoneListenerProps {
  onTranscript?: (transcript: string) => void;
}

export default function PhoneListener({ onTranscript }: PhoneListenerProps) {
  const [isSupported, setIsSupported] = useState(true);
  const lastTranscriptRef = useRef<string>('');
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setIsSupported(false);
      return;
    }
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    return () => {
      SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
        <span className="text-sm text-red-400">Speech not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        listening ? 'bg-guardian-secure/20 border border-guardian-secure/30' : 'bg-slate-700/50 border border-slate-600/30'
      }`}>
        <div className="relative">
          <svg className={`w-5 h-5 ${listening ? 'text-guardian-secure' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {listening && <span className="absolute -top-1 -right-1 w-2 h-2 bg-guardian-secure rounded-full animate-ping" />}
        </div>
        <span className={`text-sm font-medium ${listening ? 'text-guardian-secure' : 'text-slate-400'}`}>
          {listening ? 'Microphone Active' : 'Microphone Off'}
        </span>
      </div>
      <button
        onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true, language: 'en-US' })}
        className={`p-2 rounded-lg transition-colors ${listening ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-guardian-secure/20 hover:bg-guardian-secure/30 text-guardian-secure'}`}
      >
        {listening ? '⏹' : '▶'}
      </button>
      <button onClick={resetTranscript} className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400">↻</button>
    </div>
  );
}
