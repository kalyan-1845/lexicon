"use client";
import { useState, useEffect, useRef } from "react";

type AgentWorkflowProps = {
  activeAgent?: string | null;
  statusMessage?: string | null;
};

export default function AgentWorkflow({ activeAgent, statusMessage }: AgentWorkflowProps) {
  const [elapsed, setElapsed] = useState<Record<string, number>>({ Researcher: 0, Analyst: 0, Lexicon: 0 });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const agents = [
    { 
      name: "Researcher", 
      label: "Fact-Finding", 
      color: "from-indigo-500 to-indigo-600",
      description: "Extracts core factual assertions, isolates keywords, and compiles background context from uploaded document layers."
    },
    { 
      name: "Analyst", 
      label: "Synthesizing", 
      color: "from-purple-500 to-purple-600",
      description: "Profiles logical contradictions, matches structural themes, and synthesizes key conceptual patterns from extracted facts."
    },
    { 
      name: "Lexicon", 
      label: "Finalizing", 
      color: "from-blue-500 to-blue-600",
      description: "Consolidates findings into the final unified response, ensuring high factual density, professional tone, and outline structure."
    },
  ];

  // Live profiling stopwatch
  useEffect(() => {
    if (activeAgent && elapsed[activeAgent] === 0) {
      if (activeAgent === "Researcher") {
        setTimeout(() => setElapsed({ Researcher: 0, Analyst: 0, Lexicon: 0 }), 0);
      }
      
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const sec = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
        setElapsed(prev => ({
          ...prev,
          [activeAgent]: sec
        }));
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeAgent, elapsed]);

  return (
    <div className="flex flex-col gap-3 py-3 px-4 border-t border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/40 rounded-xl select-none relative w-full overflow-hidden">
      {/* Visual Graphical Connector Line Layout */}
      <div className="flex items-center justify-between max-w-lg mx-auto w-full relative">
        {/* Horizontal Connector bar */}
        <div className="absolute top-[9px] left-8 right-8 h-0.5 bg-white/[0.03] -z-10" />
        
        {agents.map((agent, i) => {
          const isActive = activeAgent === agent.name;
          const isDone = !isActive && elapsed[agent.name] > 0;
          const time = elapsed[agent.name];
          
          return (
            <div key={i} className="flex flex-col items-center gap-2 z-10 relative">
              <button 
                onClick={() => setExpandedAgent(agent.name)}
                className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? "bg-indigo-500/10 border-indigo-500/30 text-white scale-105 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                    : isDone
                      ? "bg-white/[0.02] border-[var(--theme-border)] text-gray-400"
                      : "bg-[var(--theme-bg)] border-[var(--theme-border)] text-gray-600 scale-95"
                }`}
              >
                {/* Visual pulse indicator */}
                <span className={`w-2 h-2 rounded-full ${
                  isActive 
                    ? "bg-indigo-500 animate-pulse" 
                    : isDone
                      ? "bg-green-500/50"
                      : "bg-gray-800"
                }`} />
                <span className="text-[12px] font-bold tracking-tight">{agent.name}</span>
                
                {/* Live timer telemetry */}
                {time > 0 && (
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded ml-1.5 border ${
                    isActive 
                      ? "bg-indigo-500/20 border-indigo-500/20 text-indigo-400 animate-pulse" 
                      : "bg-white/[0.02] border-[var(--theme-border)] text-gray-500"
                  }`}>
                    {time}s
                  </span>
                )}
              </button>
              
              {isActive && statusMessage && (
                <span className="text-[10px] font-semibold text-indigo-400 tracking-tight animate-bounce absolute top-full mt-2 whitespace-nowrap">
                  {statusMessage}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacing gap when active message displays */}
      {activeAgent && <div className="h-3" />}

      {/* Dynamic Cognitive Profile Expander Dialog */}
      {expandedAgent && (
        <div className="mt-3 p-4 bg-white/[0.01] border border-[var(--theme-border)] rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 relative text-left">
          <button 
            onClick={() => setExpandedAgent(null)}
            className="absolute top-3 right-3 p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {agents.filter(a => a.name === expandedAgent).map((agent, i) => (
            <div key={i} className="flex flex-col gap-1.5 pr-6">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <span className="text-[13px] font-bold text-indigo-400">{agent.name} Profile</span>
                <span className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase">({agent.label})</span>
              </div>
              <p className="text-[12px] text-[var(--theme-text-muted)] font-medium leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
