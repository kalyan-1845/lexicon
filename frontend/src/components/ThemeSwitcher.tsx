"use client";
import { useState, useEffect, useCallback } from "react";

type Theme = "obsidian" | "cyberpunk" | "emerald" | "abyss";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("obsidian");
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("theme-obsidian", "theme-cyberpunk", "theme-emerald", "theme-abyss");
    if (newTheme !== "obsidian") {
      root.classList.add(`theme-${newTheme}`);
    }
    setTheme(newTheme);
    localStorage.setItem("lexicon-theme", newTheme);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lexicon-theme") as Theme;
    if (!savedTheme) return;
    const id = requestAnimationFrame(() => {
      applyTheme(savedTheme);
    });
    return () => cancelAnimationFrame(id);
  }, [applyTheme]);

  const themes: { id: Theme; name: string; color: string; accent: string }[] = [
    { id: "obsidian", name: "Obsidian", color: "bg-[#09090b]", accent: "bg-indigo-500" },
    { id: "cyberpunk", name: "Cyberpunk", color: "bg-[#0c0012]", accent: "bg-[#ff007f]" },
    { id: "emerald", name: "Emerald", color: "bg-[#020b05]", accent: "bg-emerald-500" },
    { id: "abyss", name: "Abyss", color: "bg-[#020712]", accent: "bg-[#00d2ff]" },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-2 py-1 rounded text-[11px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all"
        title="Customize Theme"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-spin-slow">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span>Theme: <span className="capitalize font-bold text-gray-400">{theme}</span></span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-44 bg-[#0c0c0e]/95 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Select Interface Mode</h4>
            <div className="space-y-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    applyTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    theme === t.id 
                      ? "bg-white/[0.04] border-white/10 text-white" 
                      : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="capitalize">{t.name}</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.color} border border-white/10`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${t.accent}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
