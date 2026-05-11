"use client";
import { useState } from "react";

export default function SmartNotes({ onClose }: { onClose: () => void }) {
  const [note, setNote] = useState("# Research Notes\n\nStart typing your insights here...");

  return (
    <aside aria-label="Smart Notes" className="w-80 border-l border-white/[0.05] bg-[#050506] h-full flex flex-col p-6 shadow-2xl shrink-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bold text-gray-100 text-lg flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-500">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Insights
        </h2>
        <button onClick={onClose} aria-label="Close Notes" className="text-gray-500 hover:text-white transition-all bg-white/[0.03] p-1.5 rounded-lg border border-white/5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 glass-card rounded-2xl p-2 focus-within:border-white/10 transition-all">
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full bg-transparent border-none text-[14px] text-gray-300 resize-none focus:ring-0 p-4 font-mono leading-relaxed"
            placeholder="Capture your research insights here..."
          />
        </div>
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-bold text-gray-600 uppercase">{note.length} characters</span>
          <button className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
            Export Markdown
          </button>
        </div>
      </div>
    </aside>
  );
}
