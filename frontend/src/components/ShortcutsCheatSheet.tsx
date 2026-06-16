"use client";
import { useEffect, useState } from "react";

type Shortcut = {
  keys: string[];
  description: string;
};

export default function ShortcutsCheatSheet() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
  

  if ((e.ctrlKey || e.metaKey) && e.key === "/") {
    e.preventDefault();
     setIsOpen(true);
  }

  if (e.key === "Escape") {
    setIsOpen(false);
  }
    };
      window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []); 
  const shortcuts: Shortcut[] = [
    { keys: ["Ctrl", "/"], description: "Toggle Shortcuts Guide" },
    { keys: ["Ctrl", "K"], description: "Open Command Palette" },
    { keys: ["Ctrl", "Shift", "N"], description: "New Workspace" },
    { keys: ["Ctrl", "M"], description: "Open Memory Panel" },
    { keys: ["Esc"], description: "Close Modals" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />
        
        <header className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[var(--theme-text)] flex items-center gap-2">
              ⌨️ Keyboard Shortcuts
            </h3>
            <p className="text-[11px] text-[var(--theme-text-muted)] font-medium">Boost your agentic research workflow</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-white/[0.02] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.06] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center py-2 px-3 bg-white/[0.01] border border-[var(--theme-border)] rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-xs text-[var(--theme-text)] font-medium">{shortcut.description}</span>
              <div className="flex gap-1.5">
                {shortcut.keys.map((key) => (
                  <kbd 
                    key={key} 
                    className="px-2 py-0.5 text-[10px] font-black text-[var(--theme-text)] bg-white/[0.03] border border-[var(--theme-border)] border-b-2 rounded shadow-inner tracking-wider"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-6 pt-4 border-t border-[var(--theme-border)] text-center">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-wider">
            Press <span className="text-[var(--theme-text-muted)]">Ctrl + /</span> to toggle anywhere
          </p>
        </footer>
      </div>
    </div>
  );
}
