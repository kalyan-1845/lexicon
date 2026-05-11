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

        <nav aria-labelledby="collections-heading" className="space-y-1 mt-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 id="collections-heading" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Collections</h2>
            <button aria-label="Add new collection" className="text-gray-500 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          {['Deep Learning Basics', 'Finance Models', 'Career Prep'].map((item, i) => (
            <button key={i} aria-label={`Open collection ${item}`} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors truncate focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <Link 
          href="/" 
          aria-label="Navigate back to home"
          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Back to Home
        </Link>
        
        {/* Auth Profile Mock */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 mt-auto hover:bg-white/10 transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-indigo-500" tabIndex={0} role="button" aria-label="User Profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
            U
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">Guest User</span>
            <span className="text-xs text-gray-500 truncate">Sign in to sync</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-white transition-colors">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </div>
      </div>
    </aside>
  );
}
