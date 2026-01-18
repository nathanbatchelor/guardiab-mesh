"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  jobDescription: string;
  resumeFile: File | null;
  onBack: () => void;
}

export default function ChatInterface({ jobDescription, resumeFile, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI interview coach. I've reviewed the job description" + (resumeFile ? " and your resume" : "") + ". Let's begin the interview.\n\nTell me about yourself and why you're interested in this role.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response (frontend only - no actual logic)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getPlaceholderResponse(messages.length),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const getPlaceholderResponse = (questionIndex: number): string => {
    const responses = [
      "That's a great start! Can you tell me about a challenging project you've worked on and how you overcame obstacles?",
      "Interesting! How do you handle tight deadlines and pressure in your work?",
      "I appreciate the detail. What would you say is your greatest professional strength, and how has it helped you succeed?",
      "Good insight. Can you describe a time when you had to work with a difficult team member or stakeholder?",
      "Thank you for sharing. Where do you see yourself professionally in the next 5 years?",
      "That's helpful to know. Do you have any questions about the role or the company?",
    ];
    return responses[Math.min(questionIndex, responses.length - 1)];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-light hover:text-ivory transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-warm to-amber-glow flex items-center justify-center">
              <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-lg text-ivory">Interview Session</h1>
              <p className="text-xs text-slate-light flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
                AI Interviewer Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resumeFile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-accent/10 text-emerald-accent text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume loaded
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Context Card */}
          <div className="glass rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-warm/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-ivory font-medium mb-2">Job Context</h3>
                <p className="text-slate-light text-sm line-clamp-3">{jobDescription}</p>
                <button className="text-amber-warm text-sm mt-2 hover:underline">
                  Show full description
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-amber-warm to-amber-glow"
                      : "bg-gradient-to-br from-emerald-accent to-emerald-500"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-5 py-4 ${
                    message.role === "assistant"
                      ? "glass text-ivory"
                      : "bg-emerald-accent/20 text-ivory border border-emerald-accent/30"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs text-slate-light mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-warm to-amber-glow flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="glass rounded-2xl px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="typing-dot w-2 h-2 rounded-full bg-slate-light" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-slate-light" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-slate-light" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-white/5 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                rows={1}
                className="w-full px-5 py-4 rounded-2xl glass text-ivory placeholder:text-slate-light/50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all duration-300 max-h-32"
                style={{ minHeight: "56px" }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`p-4 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                inputValue.trim()
                  ? "bg-gradient-to-r from-amber-warm to-amber-glow text-midnight glow-amber hover:scale-105 active:scale-95"
                  : "bg-slate-mid text-slate-light cursor-not-allowed"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-center text-xs text-slate-light mt-3">
            Press <kbd className="px-2 py-0.5 rounded bg-slate-mid text-slate-light">Enter</kbd> to send, <kbd className="px-2 py-0.5 rounded bg-slate-mid text-slate-light">Shift+Enter</kbd> for new line
          </p>
        </div>
      </footer>
    </div>
  );
}
