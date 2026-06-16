"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type FilterType = "all" | "docs" | "chats" | "commands";

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  useEffect(() => {
    if (isOpen) {
      const savedHistory = localStorage.getItem("lexicon-search-history");
      if (savedHistory) {
        setTimeout(() => setHistory(JSON.parse(savedHistory)), 0);
      }
    }
  }, [isOpen]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...history.filter((h) => h !== term.trim())].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("lexicon-search-history", JSON.stringify(updated));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      saveSearch(query.trim());
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("lexicon-search-history");
  };

  if (!isOpen) return null;

  // Filter recommendations based on tab choice
  const showDocs = activeFilter === "all" || activeFilter === "docs";
  const showChats = activeFilter === "all" || activeFilter === "chats";
  const showCommands = activeFilter === "all" || activeFilter === "commands";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh] px-4 backdrop-blur-sm bg-black/60">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-[var(--theme-surface)]/95 border border-[var(--theme-border)] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Header Input */}
        <div className="flex items-center px-4 border-b border-[var(--theme-border)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--theme-text-muted)]">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search workspace, documents, or type a command..."
            className="flex-1 bg-transparent border-none px-4 py-3.5 text-[13px] text-[var(--theme-text)] focus:outline-none placeholder-gray-600 focus:ring-0"
          />
          <span className="text-[9px] font-black text-[var(--theme-text-muted)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--theme-border)]">ESC</span>
        </div>

        {/* Filter Toolbar Tabs */}
        <div className="flex gap-1 px-4 py-1.5 border-b border-[var(--theme-border)] bg-white/[0.01]">
          {(["all", "docs", "chats", "commands"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all border ${
                activeFilter === f 
                  ? "bg-indigo-500/10 border-indigo-500/15 text-indigo-400" 
                  : "bg-transparent border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        {/* Recommendations and Search Results */}
        <div className="p-2.5 overflow-y-auto max-h-80 select-none">
          {query.length === 0 ? (
            <>
              {/* Recent Search History */}
              {history.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.15em]">Recent Searches</span>
                    <button 
                      onClick={clearHistory}
                      className="text-[9px] font-black text-gray-600 hover:text-red-400 uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {history.map((term, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setQuery(term);
                          saveSearch(term);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--theme-text-muted)] hover:bg-white/[0.03] hover:text-[var(--theme-text)] transition-all text-left"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-700">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions Header */}
              <div className="px-2 py-1 text-[9px] font-black text-gray-600 uppercase tracking-[0.15em] mb-1">Suggestions</div>
              
              {/* Document actions */}
              {showDocs && (
                <button 
                  onClick={() => {
                    saveSearch("Upload PDF");
                    setIsOpen(false);
                    router.push('/workspace');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('lexicon-action', { detail: { type: 'upload-pdf' } }));
                    }, 100);
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-[var(--theme-text)] hover:bg-white/[0.03] hover:text-[var(--theme-text)] transition-all text-left"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span>Upload new PDF document</span>
                </button>
              )}
              
              {/* Chat actions */}
              {showChats && (
                <button 
                  onClick={() => {
                    saveSearch("New AI Chat");
                    setIsOpen(false);
                    router.push('/workspace');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('lexicon-action', { detail: { type: 'new-chat' } }));
                    }, 100);
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-[var(--theme-text)] hover:bg-white/[0.03] hover:text-[var(--theme-text)] transition-all text-left"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Start a new AI Chat</span>
                </button>
              )}

              {/* Commands */}
              {showCommands && (
                <>
                  <div className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] font-semibold text-[var(--theme-text-muted)] hover:bg-white/[0.03] hover:text-[var(--theme-text)] transition-all text-left">
                    <div className="flex items-center gap-3">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--theme-text-muted)]">
                        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                        <line x1="6" y1="8" x2="6.01" y2="8"></line>
                        <line x1="10" y1="8" x2="14" y2="8"></line>
                      </svg>
                      <span>Keyboard Shortcuts Panel</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 bg-white/[0.02] border border-[var(--theme-border)] px-1 py-0.2 rounded">?</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-[var(--theme-text-muted)] font-semibold">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
