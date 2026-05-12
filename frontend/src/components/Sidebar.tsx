"use client";
import { useState } from "react";
import Link from "next/link";
import MemoryModal from "@/components/MemoryModal";

type SidebarProps = {
  workspaces: { name: string; collectionId: string | null }[];
  activeWorkspace: string;
  onWorkspaceChange: (name: string) => void;
  onAddWorkspace: () => void;
  collections: string[];
  activeCollection: string | null;
  onCollectionChange: (name: string) => void;
  onAddCollection: () => void;
};

export default function Sidebar({ 
  workspaces, 
  activeWorkspace, 
  onWorkspaceChange, 
  onAddWorkspace,
  collections,
  activeCollection,
  onCollectionChange,
  onAddCollection
}: SidebarProps) {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
      <aside className="w-52 border-r border-white/[0.04] bg-[#09090b] flex flex-col h-full shrink-0">
        <div className="p-3 flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded bg-white flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-[12px] tracking-tight text-white uppercase">Lexicon</span>
        </div>

        <div className="flex-1 overflow-y-auto px-1.5 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.15em]">
                {activeCollection ? `In ${activeCollection}` : 'Workspaces'}
              </span>
              <button 
                onClick={onAddWorkspace}
                className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-white transition-all"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {workspaces.map((item) => (
                <button 
                  key={item.name} 
                  onClick={() => onWorkspaceChange(item.name)}
                  className={`w-full text-left px-2 py-0.5 rounded text-[11px] font-medium transition-colors truncate ${
                    activeWorkspace === item.name ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {workspaces.length === 0 && (
                <p className="px-2 py-1 text-[10px] text-gray-700 italic text-center">Empty</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.15em]">Collections</span>
              <button 
                onClick={onAddCollection}
                className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-white transition-all"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {collections.map((item) => (
                <button 
                  key={item} 
                  onClick={() => onCollectionChange(item)}
                  className={`w-full flex items-center gap-2 text-left px-2 py-0.5 rounded text-[11px] font-medium transition-colors truncate ${
                    activeCollection === item ? "text-white bg-white/[0.04]" : "text-gray-500 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={activeCollection === item ? "text-white" : "text-gray-700"}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-1.5 border-t border-white/[0.04] space-y-0.5">
          <Link href="/" className="flex items-center gap-2 w-full px-2 py-1 rounded text-[11px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            Home
          </Link>
          <button onClick={() => setShowMemoryModal(true)} className="flex items-center gap-2 w-full px-2 py-1 rounded text-[11px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            Memory
          </button>
          
          <div className="mt-2 p-1 rounded bg-white/[0.02] border border-white/[0.04] flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all group">
            <div className="relative w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=lexicon" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-semibold text-gray-300 truncate group-hover:text-white transition-colors">Lexicon Lead</span>
              <span className="text-[7px] text-gray-600 font-black uppercase tracking-tight leading-none">Pro Plan</span>
            </div>
          </div>

        </div>
      </aside>
      {showMemoryModal && <MemoryModal onClose={() => setShowMemoryModal(false)} />}
    </>
  );
}
