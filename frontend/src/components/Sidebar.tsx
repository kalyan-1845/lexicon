"use client";
import { useState } from "react";
import Link from "next/link";
import MemoryModal from "@/components/MemoryModal";

type SidebarProps = {
  activeWorkspace: string;
  onWorkspaceChange: (name: string) => void;
};

export default function Sidebar({ activeWorkspace, onWorkspaceChange }: SidebarProps) {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
      <aside className="w-56 border-r border-white/[0.04] bg-[#09090b] flex flex-col h-full shrink-0">
        <div className="p-3 flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-[13px] tracking-tight text-white">Lexicon</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Workspaces</span>
              <button 
                onClick={() => alert("New Workspace coming soon")}
                className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-white transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-1 space-y-0.5">
              {['Neural Networks', 'Market Q3', 'Resume Opt'].map((item) => (
                <button 
                  key={item} 
                  onClick={() => onWorkspaceChange(item)}
                  className={`w-full text-left px-2 py-1 rounded-md text-[11px] transition-colors truncate ${
                    activeWorkspace === item ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Collections</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {['Deep Learning', 'Finance', 'Career'].map((item) => (
                <button key={item} className="w-full flex items-center gap-2 text-left px-2 py-1 rounded-md text-[11px] text-gray-500 hover:text-white hover:bg-white/[0.02] transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-700">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-white/[0.04] space-y-0.5">
          <Link href="/" className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[11px] text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            Home
          </Link>
          <button onClick={() => setShowMemoryModal(true)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[11px] text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            Memory
          </button>
          
          <div className="mt-3 p-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[9px] font-bold">U</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-semibold text-gray-300 truncate">Guest</span>
              <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tight leading-none">Free</span>
            </div>
          </div>
        </div>
      </aside>
      {showMemoryModal && <MemoryModal onClose={() => setShowMemoryModal(false)} />}
    </>
  );
}
