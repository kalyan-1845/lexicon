"use client";
import { useState, useEffect } from "react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh] px-4 backdrop-blur-sm bg-black/40">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-gray-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        <div className="flex items-center px-4 border-b border-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace, documents, or type a command..."
            className="flex-1 bg-transparent border-none px-4 py-4 text-gray-200 focus:outline-none placeholder-gray-500"
          />
          <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">ESC</span>
        </div>
        
        <div className="p-2 overflow-y-auto max-h-80">
          {query.length === 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggestions</div>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Upload new PDF document
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Start a new AI Chat
              </button>
            </>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
