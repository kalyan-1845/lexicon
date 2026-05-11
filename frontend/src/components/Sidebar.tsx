import Link from "next/link";

export default function Sidebar() {
  return (
    <aside aria-label="Sidebar" className="w-64 border-r border-white/5 bg-[#0a0a0b] h-full flex flex-col hidden md:flex">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">L</span>
        </div>
        <span className="font-bold text-lg tracking-tight">Lexicon AI</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <button aria-label="Create New Workspace" className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-colors border border-indigo-500/20 mb-6 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="font-medium text-sm">New Workspace</span>
        </button>

        <nav aria-labelledby="recent-research-heading" className="space-y-1">
          <h2 id="recent-research-heading" className="text-xs font-medium text-gray-500 mb-2 px-2 uppercase tracking-wider">Recent Research</h2>
          {['Neural Networks PDF', 'Market Analysis Q3', 'Resume Optimization'].map((item, i) => (
            <button key={i} aria-label={`Open workspace ${item}`} className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors truncate focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none">
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <Link 
          href="/" 
          aria-label="Navigate back to home"
          className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
        >
          ← Back to Home
        </Link>
      </div>
    </aside>
  );
}
