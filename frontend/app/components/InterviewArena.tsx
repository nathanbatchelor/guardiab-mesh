"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  Brain,
  Swords,
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
  Upload,
  Crown,
  Zap,
  MessageSquare,
  FileText,
  Briefcase,
} from "lucide-react";

interface Round {
  id: number;
  question: string;
  ai1Answer: string;
  ai2Answer: string;
  winner: "ai1" | "ai2" | null;
  bestAnswer: string;
  explanation: string;
  status: "asking" | "competing" | "judging" | "complete";
}

// Mock data for demonstration
const MOCK_QUESTIONS = [
  "Tell me about a time you had to work under pressure. How did you handle it?",
  "What's your greatest professional achievement and why does it matter?",
  "Describe a situation where you had to learn something quickly. How did you approach it?",
  "How do you handle disagreements with team members?",
];

const MOCK_ANSWERS = {
  ai1: [
    "During my internship at TechCorp, we faced a critical deadline when our main developer fell ill. I stepped up and worked 60-hour weeks, learning new frameworks on the fly. I created a detailed timeline, prioritized ruthlessly, and we shipped on time. This taught me that pressure reveals character.",
    "I led a migration of our legacy authentication system serving 2 million users. The project required coordinating 5 teams across 3 time zones. We completed it with zero downtime and reduced login times by 40%. It matters because it proved I can lead complex technical initiatives.",
    "When our team pivoted to React Native, I had no mobile experience. I spent weekends on tutorials, paired with senior devs, and shipped my first feature in 2 weeks. I find that teaching what I learn helps cement knowledge, so I documented everything for future team members.",
    "I had a disagreement about API design with a senior engineer. Instead of escalating, I created prototypes of both approaches and ran benchmarks. The data showed his approach was actually better for our use case. I learned to let evidence drive decisions, not ego.",
  ],
  ai2: [
    "I managed to deliver three major features in one sprint when our PM suddenly moved the deadline up by two weeks. I renegotiated scope with stakeholders, automated repetitive testing tasks, and held daily standups to catch blockers early. The key was transparent communication about what was realistic.",
    "I built an internal tool that automated our deployment pipeline, reducing release time from 4 hours to 15 minutes. This saved the team 20+ hours per week. It matters because it showed I identify high-impact problems and solve them without being asked.",
    "My company adopted Kubernetes overnight due to scaling issues. Within a month, I became the go-to person for container orchestration by taking courses, reading documentation, and experimenting in a personal cluster. Hands-on practice accelerates learning faster than passive study.",
    "I disagreed with my tech lead about introducing a new framework. Rather than argue, I suggested a time-boxed proof of concept. After two weeks, we found the new framework would require rewriting too much code. The experiment saved us from a costly mistake and strengthened our working relationship.",
  ],
};

const MOCK_BEST_ANSWERS = [
  "During my internship at TechCorp, we faced a critical deadline when our main developer fell ill. I proactively stepped up, creating a detailed timeline and prioritizing ruthlessly. I combined transparent communication with stakeholders about realistic scope while automating repetitive tasks. We shipped on time, and I learned that pressure reveals character while also teaching me the power of clear communication.",
  "I built an internal deployment automation tool that reduced release time from 4 hours to 15 minutes, saving 20+ team hours weekly. What made this impactful was identifying the problem independently and solving it without being asked. This demonstrates initiative and the ability to find high-leverage opportunities that multiply team productivity.",
  "When my company adopted Kubernetes overnight, I took a multi-pronged approach: formal courses for theory, documentation for depth, and a personal cluster for hands-on practice. Within a month, I became the team's go-to resource. I then documented my learnings for future team members, multiplying the value of my learning journey.",
  "I disagreed with my tech lead about introducing a new framework. Instead of arguing based on opinion, I proposed a time-boxed proof of concept. Two weeks of experimentation revealed the migration cost was too high. This data-driven approach saved us from a costly mistake and actually strengthened our working relationship by establishing a pattern for resolving future disagreements.",
];

const MOCK_EXPLANATIONS = [
  "AI 1's answer was strong in specificity, but AI 2's emphasis on stakeholder communication and scope negotiation showed more mature project management skills. The combined answer takes the best of both: specific examples with strategic communication.",
  "AI 2 wins this round because the answer demonstrates initiative and quantifiable impact. However, AI 1's emphasis on team coordination is valuable. The best answer combines both perspectives.",
  "AI 2's answer was more actionable with specific learning methods. The best answer incorporates AI 1's excellent point about documenting and teaching to cement knowledge.",
  "Both answers showed emotional intelligence and data-driven decision making. AI 1's approach of creating prototypes and AI 2's time-boxed experiment are both excellent. The combined answer synthesizes these approaches.",
];

type InputMode = "paste" | "upload";

export default function InterviewArena() {
  // Job description state
  const [jobDescription, setJobDescription] = useState("");

  // Resume state
  const [resumeInputMode, setResumeInputMode] = useState<InputMode>("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isResumeDragging, setIsResumeDragging] = useState(false);

  const [isStarted, setIsStarted] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [typingProgress, setTypingProgress] = useState({ ai1: 0, ai2: 0 });
  const [displayedText, setDisplayedText] = useState({ ai1: "", ai2: "" });

  const currentRound = rounds[currentRoundIndex];

  // Simulate typing effect
  useEffect(() => {
    if (!currentRound || currentRound.status !== "competing") return;

    const ai1Full = MOCK_ANSWERS.ai1[currentRoundIndex];
    const ai2Full = MOCK_ANSWERS.ai2[currentRoundIndex];

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        const newAi1 =
          prev.ai1.length < ai1Full.length
            ? ai1Full.slice(0, prev.ai1.length + 3)
            : prev.ai1;
        const newAi2 =
          prev.ai2.length < ai2Full.length
            ? ai2Full.slice(0, prev.ai2.length + 2)
            : prev.ai2;

        setTypingProgress({
          ai1: (newAi1.length / ai1Full.length) * 100,
          ai2: (newAi2.length / ai2Full.length) * 100,
        });

        if (
          newAi1.length >= ai1Full.length &&
          newAi2.length >= ai2Full.length
        ) {
          // Move to judging phase
          setTimeout(() => {
            setRounds((prev) =>
              prev.map((r, i) =>
                i === currentRoundIndex ? { ...r, status: "judging" } : r
              )
            );
            // Simulate judging delay
            setTimeout(() => {
              setRounds((prev) =>
                prev.map((r, i) =>
                  i === currentRoundIndex
                    ? {
                        ...r,
                        status: "complete",
                        winner: Math.random() > 0.5 ? "ai1" : "ai2",
                        ai1Answer: ai1Full,
                        ai2Answer: ai2Full,
                        bestAnswer: MOCK_BEST_ANSWERS[currentRoundIndex],
                        explanation: MOCK_EXPLANATIONS[currentRoundIndex],
                      }
                    : r
                )
              );
            }, 2000);
          }, 500);
        }

        return { ai1: newAi1, ai2: newAi2 };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [currentRound?.status, currentRoundIndex]);

  const handleStart = () => {
    setIsStarted(true);
    const newRound: Round = {
      id: 1,
      question: MOCK_QUESTIONS[0],
      ai1Answer: "",
      ai2Answer: "",
      winner: null,
      bestAnswer: "",
      explanation: "",
      status: "asking",
    };
    setRounds([newRound]);

    // Simulate asking delay then start competing
    setTimeout(() => {
      setRounds([{ ...newRound, status: "competing" }]);
      setDisplayedText({ ai1: "", ai2: "" });
      setTypingProgress({ ai1: 0, ai2: 0 });
    }, 2000);
  };

  const handleNextRound = () => {
    if (currentRoundIndex >= MOCK_QUESTIONS.length - 1) return;

    const nextIndex = currentRoundIndex + 1;
    const newRound: Round = {
      id: nextIndex + 1,
      question: MOCK_QUESTIONS[nextIndex],
      ai1Answer: "",
      ai2Answer: "",
      winner: null,
      bestAnswer: "",
      explanation: "",
      status: "asking",
    };

    setRounds((prev) => [...prev, newRound]);
    setCurrentRoundIndex(nextIndex);
    setDisplayedText({ ai1: "", ai2: "" });
    setTypingProgress({ ai1: 0, ai2: 0 });

    setTimeout(() => {
      setRounds((prev) =>
        prev.map((r, i) =>
          i === nextIndex ? { ...r, status: "competing" } : r
        )
      );
    }, 2000);
  };

  // Resume file handlers
  const handleResumeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(true);
  };

  const handleResumeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(false);
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsResumeDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  // Toggle component
  const InputModeToggle = ({
    mode,
    setMode,
    label,
    color = "amber",
  }: {
    mode: InputMode;
    setMode: (mode: InputMode) => void;
    label: string;
    color?: "amber" | "emerald";
  }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-light text-sm">{label}:</span>
      <div className="flex rounded-lg overflow-hidden bg-slate-deep/50 border border-slate-mid/30">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`px-3 py-1.5 text-sm transition-all ${
            mode === "paste"
              ? color === "amber"
                ? "bg-amber-warm text-midnight font-medium"
                : "bg-emerald-accent text-midnight font-medium"
              : "text-slate-light hover:text-pearl"
          }`}
        >
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-3 py-1.5 text-sm transition-all ${
            mode === "upload"
              ? color === "amber"
                ? "bg-amber-warm text-midnight font-medium"
                : "bg-emerald-accent text-midnight font-medium"
              : "text-slate-light hover:text-pearl"
          }`}
        >
          Upload PDF
        </button>
      </div>
    </div>
  );

  const handleReset = () => {
    setIsStarted(false);
    setRounds([]);
    setCurrentRoundIndex(0);
    setDisplayedText({ ai1: "", ai2: "" });
    setTypingProgress({ ai1: 0, ai2: 0 });
    setJobDescription("");
    setResumeText("");
    setResumeFile(null);
  };

  // Check if form is valid
  const isFormValid = jobDescription.trim().length > 0;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-midnight relative overflow-hidden">
        <div className="bg-mesh" />

        {/* Animated arena background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <Swords className="w-10 h-10 text-amber-warm" />
              <h1 className="font-heading text-5xl font-bold bg-gradient-to-r from-amber-warm via-amber-glow to-emerald-accent bg-clip-text text-transparent">
                Interview Arena
              </h1>
              <Swords className="w-10 h-10 text-emerald-accent scale-x-[-1]" />
            </div>
            <p className="text-slate-light text-lg max-w-2xl mx-auto">
              Watch two AI contestants compete to craft the perfect interview
              answer. The Interviewer AI will judge and synthesize the best
              response.
            </p>
          </div>

          {/* Arena Preview Cards */}
          <div className="grid grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-200">
            <Card className="glass border-cyan-500/30 text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-lg text-cyan-400 mb-2">
                Challenger Alpha
              </h3>
              <p className="text-sm text-slate-light">
                Strategic & analytical approach
              </p>
            </Card>

            <Card className="glass border-amber-500/30 text-center p-6 scale-110">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center glow-amber">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading text-xl text-amber-warm mb-2">
                The Interviewer
              </h3>
              <p className="text-sm text-slate-light">
                Judges & synthesizes the best answer
              </p>
            </Card>

            <Card className="glass border-rose-500/30 text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-lg text-rose-400 mb-2">
                Challenger Beta
              </h3>
              <p className="text-sm text-slate-light">
                Creative & intuitive approach
              </p>
            </Card>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-2 gap-6 animate-fade-in-up delay-300">
            {/* Job Description Input */}
            <Card className="glass border-emerald-500/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-accent" />
                  <h2 className="font-heading text-xl text-pearl">
                    Job Description
                    <span className="text-rose-400 ml-1">*</span>
                  </h2>
                </div>
                <p className="text-sm text-slate-light">
                  The role you&apos;re interviewing for
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here... The Interviewer will tailor questions to this specific role and requirements."
                  className="min-h-[250px] bg-slate-deep/50 border-slate-mid/50 text-pearl placeholder:text-slate-light/50 resize-none"
                />
              </CardContent>
            </Card>

            {/* Resume Input */}
            <Card className="glass border-amber-500/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-warm" />
                  <h2 className="font-heading text-xl text-pearl">
                    Your Resume
                    <span className="text-slate-light text-sm font-normal ml-2">
                      (optional)
                    </span>
                  </h2>
                </div>
                <p className="text-sm text-slate-light">
                  Both AI challengers will use this
                </p>
              </CardHeader>
              <CardContent>
                <InputModeToggle
                  mode={resumeInputMode}
                  setMode={setResumeInputMode}
                  label="Input method"
                  color="amber"
                />

                {resumeInputMode === "paste" ? (
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here... Include your experience, skills, education, and achievements."
                    className="min-h-[220px] bg-slate-deep/50 border-slate-mid/50 text-pearl placeholder:text-slate-light/50 resize-none"
                  />
                ) : (
                  <div
                    onDragOver={handleResumeDragOver}
                    onDragLeave={handleResumeDragLeave}
                    onDrop={handleResumeDrop}
                    className={`relative min-h-[220px] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                      isResumeDragging
                        ? "border-amber-warm bg-amber-warm/10"
                        : resumeFile
                        ? "border-emerald-accent/50 bg-emerald-accent/5"
                        : "border-slate-mid/50 bg-slate-deep/30 hover:border-amber-warm/50 hover:bg-slate-deep/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {resumeFile ? (
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-accent/20 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-emerald-accent" />
                        </div>
                        <p className="text-pearl font-medium mb-1">
                          {resumeFile.name}
                        </p>
                        <p className="text-sm text-slate-light">
                          {(resumeFile.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeFile(null);
                          }}
                          className="mt-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                            isResumeDragging ? "bg-amber-warm/20" : "bg-slate-mid/30"
                          }`}
                        >
                          <Upload
                            className={`w-8 h-8 transition-colors ${
                              isResumeDragging ? "text-amber-warm" : "text-slate-light"
                            }`}
                          />
                        </div>
                        <p className="text-pearl font-medium mb-1">
                          {isResumeDragging
                            ? "Drop your resume here"
                            : "Drag & drop your resume"}
                        </p>
                        <p className="text-sm text-slate-light mb-3">
                          or click to browse
                        </p>
                        <p className="text-xs text-slate-light/60">
                          Supports PDF, DOC, DOCX, TXT
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="flex justify-center mt-10 animate-fade-in-up delay-400">
            <Button
              onClick={handleStart}
              disabled={!isFormValid}
              size="lg"
              className={`font-semibold px-12 py-6 text-lg rounded-full transition-all duration-300 ${
                isFormValid
                  ? "bg-gradient-to-r from-amber-warm to-amber-glow hover:from-amber-glow hover:to-amber-warm text-midnight hover:scale-105 hover:shadow-lg hover:shadow-amber-warm/30"
                  : "bg-slate-mid text-slate-light cursor-not-allowed"
              }`}
            >
              <Play className="w-6 h-6 mr-3" />
              Enter the Arena
            </Button>
          </div>
          
          {!isFormValid && (
            <p className="text-center text-slate-light text-sm mt-4 animate-fade-in-up delay-400">
              Please provide a job description to continue
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight relative overflow-hidden">
      <div className="bg-mesh" />

      {/* Dynamic arena background based on state */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {currentRound?.status === "competing" && (
          <>
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-cyan-500/5 to-transparent animate-pulse" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/5 to-transparent animate-pulse delay-500" />
          </>
        )}
        {currentRound?.status === "judging" && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-amber-500/10 animate-pulse" />
        )}
        {currentRound?.status === "complete" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full blur-3xl" />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Swords className="w-8 h-8 text-amber-warm" />
            <h1 className="font-heading text-3xl font-bold text-pearl">
              Interview Arena
            </h1>
            <Badge
              variant="outline"
              className="border-amber-warm/50 text-amber-warm"
            >
              Round {currentRoundIndex + 1} of {MOCK_QUESTIONS.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-mid text-slate-light hover:text-pearl hover:border-pearl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Interviewer Section */}
        <Card className="glass border-amber-500/30 mb-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-warm via-amber-glow to-amber-warm" />
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar className="w-20 h-20 border-4 border-amber-warm/50">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                    <Crown className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-heading text-2xl text-amber-warm">
                    The Interviewer
                  </h2>
                  {currentRound?.status === "asking" && (
                    <Badge className="bg-amber-warm/20 text-amber-warm border-amber-warm/50 animate-pulse">
                      <Mic className="w-3 h-3 mr-1" />
                      Asking...
                    </Badge>
                  )}
                  {currentRound?.status === "judging" && (
                    <Badge className="bg-amber-warm/20 text-amber-warm border-amber-warm/50 animate-pulse">
                      <Brain className="w-3 h-3 mr-1" />
                      Judging...
                    </Badge>
                  )}
                </div>

                <div className="bg-slate-deep/50 rounded-xl p-4 border border-amber-warm/20">
                  <p className="text-lg text-pearl leading-relaxed">
                    &ldquo;{currentRound?.question}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitors Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* AI 1 - Challenger Alpha */}
          <Card
            className={`glass overflow-hidden transition-all duration-500 ${
              currentRound?.winner === "ai1"
                ? "border-emerald-500/50 ring-2 ring-emerald-500/30"
                : "border-cyan-500/30"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-cyan-500/50">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                      <Brain className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-heading text-xl text-cyan-400">
                      Challenger Alpha
                    </h3>
                    <p className="text-sm text-slate-light">
                      Strategic Analyst
                    </p>
                  </div>
                </div>
                {currentRound?.winner === "ai1" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    <Trophy className="w-3 h-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
              {currentRound?.status === "competing" && (
                <Progress
                  value={typingProgress.ai1}
                  className="h-1 mt-4 bg-slate-mid"
                />
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="bg-slate-deep/30 rounded-lg p-4 min-h-[180px]">
                  {currentRound?.status === "competing" ? (
                    <p className="text-pearl leading-relaxed">
                      {displayedText.ai1}
                      <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />
                    </p>
                  ) : currentRound?.status === "complete" ? (
                    <p className="text-pearl leading-relaxed">
                      {currentRound.ai1Answer}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-light">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full typing-dot" />
                      </div>
                      Preparing response...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI 2 - Challenger Beta */}
          <Card
            className={`glass overflow-hidden transition-all duration-500 ${
              currentRound?.winner === "ai2"
                ? "border-emerald-500/50 ring-2 ring-emerald-500/30"
                : "border-rose-500/30"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-rose-500/50">
                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                      <Zap className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-heading text-xl text-rose-400">
                      Challenger Beta
                    </h3>
                    <p className="text-sm text-slate-light">
                      Creative Innovator
                    </p>
                  </div>
                </div>
                {currentRound?.winner === "ai2" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    <Trophy className="w-3 h-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
              {currentRound?.status === "competing" && (
                <Progress
                  value={typingProgress.ai2}
                  className="h-1 mt-4 bg-slate-mid"
                />
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="bg-slate-deep/30 rounded-lg p-4 min-h-[180px]">
                  {currentRound?.status === "competing" ? (
                    <p className="text-pearl leading-relaxed">
                      {displayedText.ai2}
                      <span className="inline-block w-2 h-5 bg-rose-400 ml-1 animate-pulse" />
                    </p>
                  ) : currentRound?.status === "complete" ? (
                    <p className="text-pearl leading-relaxed">
                      {currentRound.ai2Answer}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-light">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-rose-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-rose-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-rose-400 rounded-full typing-dot" />
                      </div>
                      Preparing response...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Verdict Section */}
        {currentRound?.status === "judging" && (
          <Card className="glass border-amber-500/30 animate-fade-in-up">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Brain className="w-8 h-8 text-amber-warm animate-pulse" />
                <h3 className="font-heading text-2xl text-amber-warm">
                  The Interviewer is deliberating...
                </h3>
              </div>
              <div className="flex justify-center gap-2">
                <span className="w-3 h-3 bg-amber-warm rounded-full animate-bounce" />
                <span className="w-3 h-3 bg-amber-warm rounded-full animate-bounce delay-100" />
                <span className="w-3 h-3 bg-amber-warm rounded-full animate-bounce delay-200" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentRound?.status === "complete" && (
          <Card className="glass border-emerald-500/30 animate-fade-in-up overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-warm to-emerald-500" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-emerald-accent" />
                <h3 className="font-heading text-2xl text-emerald-accent">
                  The Verdict
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Why this answer was better */}
              <div className="bg-slate-deep/30 rounded-xl p-4 border border-slate-mid/30">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-amber-warm" />
                  <h4 className="font-semibold text-amber-warm">
                    Interviewer&apos;s Analysis
                  </h4>
                </div>
                <p className="text-pearl leading-relaxed">
                  {currentRound.explanation}
                </p>
              </div>

              <Separator className="bg-slate-mid/30" />

              {/* Best Combined Answer */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-warm" />
                  <h4 className="font-semibold text-pearl">
                    The Optimal Answer
                  </h4>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 ml-2">
                    Best of Both
                  </Badge>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/10 rounded-xl p-6 border border-emerald-500/20">
                  <p className="text-pearl leading-relaxed text-lg">
                    &ldquo;{currentRound.bestAnswer}&rdquo;
                  </p>
                </div>
              </div>

              {/* Next Round Button */}
              {currentRoundIndex < MOCK_QUESTIONS.length - 1 && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleNextRound}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-accent to-emerald-600 hover:from-emerald-600 hover:to-emerald-accent text-white font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30"
                  >
                    <Swords className="w-5 h-5 mr-2" />
                    Next Round
                  </Button>
                </div>
              )}

              {currentRoundIndex >= MOCK_QUESTIONS.length - 1 && (
                <div className="text-center pt-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-warm/20 to-emerald-accent/20 rounded-full border border-amber-warm/30">
                    <Trophy className="w-6 h-6 text-amber-warm" />
                    <span className="font-heading text-xl text-pearl">
                      Interview Complete!
                    </span>
                    <Trophy className="w-6 h-6 text-emerald-accent" />
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="mt-6 border-slate-mid text-slate-light hover:text-pearl hover:border-pearl"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start New Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Round History */}
        {rounds.length > 1 && (
          <div className="mt-8">
            <h3 className="font-heading text-lg text-slate-light mb-4">
              Previous Rounds
            </h3>
            <div className="flex gap-2">
              {rounds.map((round, idx) => (
                <Button
                  key={round.id}
                  variant={idx === currentRoundIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentRoundIndex(idx)}
                  className={
                    idx === currentRoundIndex
                      ? "bg-amber-warm text-midnight"
                      : "border-slate-mid text-slate-light hover:text-pearl"
                  }
                >
                  Round {round.id}
                  {round.status === "complete" && round.winner && (
                    <span
                      className={`ml-2 w-2 h-2 rounded-full ${
                        round.winner === "ai1" ? "bg-cyan-400" : "bg-rose-400"
                      }`}
                    />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
