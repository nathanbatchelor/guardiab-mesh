"use client";

import { useState, useRef } from "react";

interface JobInputFormProps {
  onStart: (jobDescription: string, resumeFile: File | null) => void;
}

export default function JobInputForm({ onStart }: JobInputFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("document"))) {
      setResumeFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onStart(jobDescription, resumeFile);
    }
  };

  const isValid = jobDescription.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            <span className="text-sm text-slate-light">AI Interview Coach</span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-semibold text-ivory mb-4">
            Ace Your Next Interview
          </h1>
          <p className="text-slate-light text-lg max-w-md mx-auto">
            Practice with an AI interviewer that adapts questions based on your target role
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Description */}
          <div className="animate-fade-in-up delay-100" style={{ opacity: 0 }}>
            <label className="block mb-3">
              <span className="text-ivory font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Job Description
                <span className="text-rose-accent">*</span>
              </span>
            </label>
            <div className="relative group">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here. Include role title, responsibilities, requirements, and any other relevant details..."
                className="w-full h-48 px-5 py-4 rounded-2xl glass text-ivory placeholder:text-slate-light/50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all duration-300"
                required
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-light">
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="animate-fade-in-up delay-200" style={{ opacity: 0 }}>
            <label className="block mb-3">
              <span className="text-ivory font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume
                <span className="text-slate-light text-sm font-normal">(optional)</span>
              </span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl glass p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? "ring-2 ring-emerald-accent bg-emerald-accent/10" 
                  : "hover:bg-white/5"
              } ${resumeFile ? "ring-2 ring-emerald-accent/50" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-accent/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-ivory font-medium">{resumeFile.name}</p>
                    <p className="text-slate-light text-sm">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                    }}
                    className="ml-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-mid/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-ivory mb-1">
                    Drop your resume here or <span className="text-amber-warm">browse</span>
                  </p>
                  <p className="text-slate-light text-sm">
                    PDF, DOC, or DOCX up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="animate-fade-in-up delay-300 pt-4" style={{ opacity: 0 }}>
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                isValid
                  ? "bg-gradient-to-r from-amber-warm to-amber-glow text-midnight glow-amber hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-mid text-slate-light cursor-not-allowed"
              }`}
            >
              Start Interview
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Tips */}
          <div className="animate-fade-in-up delay-400 pt-4" style={{ opacity: 0 }}>
            <div className="glass rounded-2xl p-5">
              <h3 className="text-ivory font-medium mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips for best results
              </h3>
              <ul className="space-y-2 text-sm text-slate-light">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-accent mt-1">•</span>
                  Include the full job description with requirements and responsibilities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-accent mt-1">•</span>
                  Upload your resume for personalized behavioral questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-accent mt-1">•</span>
                  Treat this like a real interview - practice makes perfect!
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
