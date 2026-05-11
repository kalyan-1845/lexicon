"use client";
import { useState } from "react";
import Link from "next/link";
import MemoryModal from "@/components/MemoryModal";

export default function Sidebar() {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
    <>
      <aside aria-label="Sidebar" className="w-64 border-r border-white/5 bg-[#050506] h-full flex flex-col hidden md:flex shrink-0">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Lexicon AI</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
        <button aria-label="Create New Workspace" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-300 font-semibold shadow-xl shadow-white/5 focus-visible:ring-2 focus-visible:ring-white focus:outline-none">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Workspace
        </button>

        <nav aria-labelledby="recent-research-heading" className="space-y-1">
          <h2 id="recent-research-heading" className="text-[10px] font-bold text-gray-500 mb-4 px-3 uppercase tracking-[0.2em]">Recent Research</h2>
          {['Neural Networks PDF', 'Market Analysis Q3', 'Resume Optimization'].map((item, i) => (
            <button key={i} aria-label={`Open workspace ${item}`} className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all duration-200 truncate border border-transparent hover:border-white/[0.05]">
              {item}
            </button>
          ))}
        </nav>

        <nav aria-labelledby="collections-heading" className="space-y-1">
          <div className="flex items-center justify-between mb-4 px-3">
            <h2 id="collections-heading" className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Collections</h2>
            <button aria-label="Add new collection" className="text-gray-500 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          {['Deep Learning Basics', 'Finance Models', 'Career Prep'].map((item, i) => (
            <button key={i} aria-label={`Open collection ${item}`} className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all duration-200 truncate border border-transparent hover:border-white/[0.05]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-indigo-400">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 space-y-2 bg-[#0a0a0b]/50">
        <Link 
          href="/" 
          aria-label="Navigate back to home"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.05]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Back to Home
        </Link>
        
        <button 
          onClick={() => setShowMemoryModal(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.05]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          AI Memory
        </button>

        {/* Auth Profile Mock */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mt-4 hover:bg-white/[0.05] transition-all cursor-pointer group" tabIndex={0} role="button" aria-label="User Profile">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            U
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold text-gray-100 truncate">Guest User</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Free Plan</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600 group-hover:text-white transition-colors">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </aside>
    {showMemoryModal && <MemoryModal onClose={() => setShowMemoryModal(false)} />}
    </>
  );
}
