import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/5 bg-[#0a0a0b] h-full flex flex-col hidden md:flex">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">L</span>
        </div>
        <span className="font-bold text-lg tracking-tight">Lexicon AI</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-colors border border-indigo-500/20 mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="font-medium text-sm">New Workspace</span>
        </button>

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 mb-2 px-2 uppercase tracking-wider">Recent Research</p>
          {['Neural Networks PDF', 'Market Analysis Q3', 'Resume Optimization'].map((item, i) => (
            <button key={i} className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors truncate">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <Link href="/">
          <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            ← Back to Home
          </button>
        </Link>
      </div>
    </aside>
  );
}
