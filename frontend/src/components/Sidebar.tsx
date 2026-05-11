"use client";
import { useState } from "react";
import Link from "next/link";
import MemoryModal from "@/components/MemoryModal";

export default function Sidebar() {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
      <aside className="w-64 border-r border-white/[0.04] bg-[#09090b] flex flex-col h-full shrink-0">
        <div className="p-4 flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Lexicon</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-6">
          <div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-gray-400">Workspaces</span>
              <button 
                onClick={() => alert("Workspace creation is coming soon!")}
                className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                title="Create New Workspace"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-1 space-y-0.5">
              {['Neural Networks', 'Market Q3', 'Resume Opt'].map((item, i) => (
                <button key={i} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/[0.02] transition-colors truncate">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.03] transition-all">
              <span>Collections</span>
            </button>
            <div className="mt-1 space-y-0.5">
              {['Deep Learning', 'Finance', 'Career'].map((item, i) => (
                <button key={i} className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/[0.02] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-white/[0.04] space-y-1">
          <Link href="/" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            Home
          </Link>
          <button onClick={() => setShowMemoryModal(true)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            Memory
          </button>
          
          <div className="mt-4 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold">U</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-semibold text-gray-300 truncate">Guest</span>
              <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">Free</span>
            </div>
          </div>
        </div>
      </aside>
      {showMemoryModal && <MemoryModal onClose={() => setShowMemoryModal(false)} />}
    </>
  );
}
