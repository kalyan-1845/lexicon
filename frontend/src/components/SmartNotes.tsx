"use client";
import { useState } from "react";

export default function SmartNotes({ onClose }: { onClose: () => void }) {
  const [note, setNote] = useState("# Research Notes\n\nStart typing your insights here...");

  return (
    <aside aria-label="Smart Notes" className="w-80 border-l border-white/5 bg-[#0a0a0b] h-full flex flex-col p-4 relative shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-200 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Smart Notes
        </h2>
        <button onClick={onClose} aria-label="Close Notes" className="text-gray-500 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 w-full bg-gray-900/50 border border-white/5 rounded-xl p-4 text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
          placeholder="Jot down your insights..."
        />
        <div className="flex justify-between items-center px-2 py-1">
          <span className="text-xs text-gray-500">{note.length} characters</span>
          <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Export Markdown
          </button>
        </div>
      </div>
    </aside>
  );
}
