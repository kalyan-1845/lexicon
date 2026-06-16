"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LandingPreview from "@/components/LandingPreview";
import Logo from "@/components/Logo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    // Simulate async data fetch (e.g., API call)
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: `${e.clientX - rect.left}px`,
      y: `${e.clientY - rect.top}px`,
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <main 
      className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] selection:bg-indigo-500/30 relative overflow-hidden cursor-spotlight"
      onMouseMove={handleMouseMove}
      style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y } as React.CSSProperties}
    >      {/* Premium Background Ambiance */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px] animate-pulse-slow pointer-events-none delay-1000" />
      
      {/* Navigation */}
      <nav className="relative max-w-7xl mx-auto flex items-center justify-between p-8 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Logo size={40} />
        <div className="flex items-center gap-6">
          <Link href="https://github.com/kalyan-1845/lexicon" target="_blank" className="text-sm font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors uppercase tracking-widest">GitHub</Link>
          <Link href="/workspace" className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white text-black hover:bg-gray-200 transition-all shadow-xl">Launch App</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-5xl mx-auto text-center pt-24 pb-32 px-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-[var(--theme-border)] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-[var(--theme-text-muted)] uppercase tracking-[0.2em]">Open Source NSoC&apos;26 Elite</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          Synthesize Knowledge <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">At Agentic Speed</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
          The high-density research workspace for modern developers. <br className="hidden md:block" />
          Unify your library, automate fact-checking, and build faster.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 fill-mode-both">
          <Link href="/workspace" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all duration-300 w-full sm:w-auto shadow-2xl">
            Get Started Free
          </Link>
          <Link href="https://github.com/kalyan-1845/lexicon#readme" target="_blank" className="px-10 py-5 rounded-2xl bg-white/[0.03] border border-[var(--theme-border)] text-[var(--theme-text)] font-bold text-lg hover:bg-white/[0.08] transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3 backdrop-blur-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Read Technical Doc
          </Link>
        </div>
      </div>

      {/* Luxury Preview Section */}
      <div className="max-w-6xl mx-auto px-6 pb-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600 fill-mode-both">
        <div className="relative group">
          {/* Glowing Border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
          
          <div className="relative bg-[var(--theme-surface)] rounded-[2rem] border border-[var(--theme-border)] p-2 shadow-2xl overflow-hidden">
            <div className="h-10 border-b border-[var(--theme-border)] flex items-center px-6 gap-2 bg-[var(--theme-bg)]/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-border)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-border)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-border)]" />
              </div>
              <div className="mx-auto text-[10px] font-extrabold text-gray-600 uppercase tracking-[0.3em] pl-6">research.lexicon.ai</div>
            </div>
            <div className="h-[600px] w-full bg-[var(--theme-bg)] relative">
              <LandingPreview />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
