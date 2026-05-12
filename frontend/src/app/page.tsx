import Link from 'next/link';
import LandingPreview from "@/components/LandingPreview";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative px-6 w-full pb-20">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow pointer-events-none delay-1000" />
      
      {/* Navigation (Simple) */}
      <nav aria-label="Main Navigation" className="absolute top-0 w-full max-w-7xl mx-auto flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">Lexicon AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/kalyan-1845/lexicon" target="_blank" aria-label="Lexicon GitHub Repository" className="text-sm font-medium text-gray-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none rounded-md px-2 py-1">
            GitHub
          </Link>
          <Link href="https://github.com/kalyan-1845/lexicon" target="_blank" aria-label="Star Lexicon on GitHub" className="px-4 py-2 text-sm font-medium rounded-full bg-white text-[#0a0a0b] hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none">
            Star Repo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center z-10 mt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Open Source NSoC'26</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
          Your Intelligent Workspace for <br className="hidden md:block" />
          <span className="text-gradient">Research & Productivity</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Unify your AI chats, document analysis, and knowledge management. Built for developers, researchers, and teams who want to work smarter.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/workspace" aria-label="Get Started with Workspace" className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-white focus:outline-none text-center">
            Get Started
          </Link>
          <button aria-label="Read Documentation" className="px-8 py-4 rounded-full glass text-white font-semibold hover:bg-white/10 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white focus:outline-none">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Read the Docs
          </button>
        </div>
      </div>

      {/* Mockup / Dashboard Preview snippet */}
      <div className="mt-20 w-full max-w-5xl glass rounded-2xl border border-white/10 p-2 overflow-hidden shadow-2xl relative z-10 animate-float">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="mx-auto text-xs font-medium text-gray-500">app.lexicon.ai</div>
        </div>
        <div className="h-[500px] w-full bg-[#0a0a0b] flex rounded-b-xl overflow-hidden text-left pointer-events-none">
           <LandingPreview />
        </div>
      </div>
    </main>
  );
}
