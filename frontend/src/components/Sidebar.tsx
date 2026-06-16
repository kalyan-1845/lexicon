"use client";
import { useState } from "react";
import Link from "next/link";
import MemoryModal from "@/components/MemoryModal";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

type SidebarProps = {
  workspaces: { name: string; collectionId: string | null }[];
  activeWorkspace: string;
  onWorkspaceChange: (name: string) => void;
  onAddWorkspace: () => void;
  collections: string[];
  activeCollection: string | null;
  onCollectionChange: (name: string) => void;
  onAddCollection: () => void;
  showMobileSidebar?: boolean;
  onMobileSidebarClose?: () => void;
};

export default function Sidebar({ 
  workspaces, 
  activeWorkspace, 
  onWorkspaceChange, 
  onAddWorkspace,
  collections,
  activeCollection,
  onCollectionChange,
  onAddCollection,
  showMobileSidebar,
  onMobileSidebarClose
}: SidebarProps) {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200" 
          onClick={onMobileSidebarClose}
        />
      )}
      
      <aside className={`
        ${showMobileSidebar ? "fixed inset-y-0 left-0 z-50 w-64 md:w-52" : "hidden md:flex w-52"} 
        border-r border-[var(--theme-border)] bg-[var(--theme-surface)]/98 md:bg-[var(--theme-bg)] flex-col h-full shrink-0 transition-all duration-300
      `}>
        <div className="p-3 mb-1 flex items-center justify-between">
          <Logo size={20} className="scale-90 origin-left" />
          {showMobileSidebar && (
            <button 
              onClick={onMobileSidebarClose}
              className="md:hidden p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-5 py-2">
          <div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-extrabold text-[var(--theme-text-muted)] uppercase tracking-widest">
                {activeCollection ? `In ${activeCollection}` : 'Workspaces'}
              </span>
              <button 
                onClick={onAddWorkspace}
                className="p-1 rounded hover:bg-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-1 space-y-1">
              {workspaces.map((item) => (
                <button 
                  key={item.name} 
                  onClick={() => onWorkspaceChange(item.name)}
                  className={`w-full text-left py-1.5 rounded text-[12px] font-semibold transition-all duration-300 truncate border-l-2 ${
                    activeWorkspace === item.name 
                      ? "text-[var(--theme-text)] bg-[rgba(var(--theme-accent-rgb),0.08)] border-[var(--theme-accent)] pl-2" 
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.02] border-transparent pl-2.5"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {workspaces.length === 0 && (
                <p className="px-2 py-2 text-[11px] text-gray-600 italic text-center">Empty</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-extrabold text-[var(--theme-text-muted)] uppercase tracking-widest">Collections</span>
              <button 
                onClick={onAddCollection}
                className="p-1 rounded hover:bg-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div className="mt-1 space-y-1">
              {collections.map((item) => (
                <button 
                  key={item} 
                  onClick={() => onCollectionChange(item)}
                  className={`w-full flex items-center gap-2 text-left py-1.5 rounded text-[12px] font-semibold transition-all duration-300 truncate border-l-2 ${
                    activeCollection === item 
                      ? "text-[var(--theme-text)] bg-[rgba(var(--theme-accent-rgb),0.08)] border-[var(--theme-accent)] pl-2" 
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.02] border-transparent pl-2.5"
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={activeCollection === item ? "text-[var(--theme-text)]" : "text-gray-600"}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-[var(--theme-border)] space-y-1">
          <Link href="/" className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded text-[12px] font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.03] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            Home
          </Link>
          <button onClick={() => setShowMemoryModal(true)} className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded text-[12px] font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.03] transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4M12 8h.01"></path>
            </svg>
            Memory
          </button>
          
          <div className="px-1 py-0.5">
            <ThemeSwitcher />
          </div>
          
          <div className="mt-2 p-2 rounded-xl bg-white/[0.02] border border-[var(--theme-border)] flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] transition-all">
            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[var(--theme-text)]">U</div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-[var(--theme-text)] truncate leading-none">Guest User</span>
              <span className="text-[8px] text-[var(--theme-text-muted)] font-extrabold uppercase tracking-wider leading-none mt-1">Free Tier</span>
            </div>
          </div>
        </div>
      </aside>
      {showMemoryModal && <MemoryModal onClose={() => setShowMemoryModal(false)} />}
    </>
  );
}
