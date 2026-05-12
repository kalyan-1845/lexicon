"use client";
import { useState } from "react";

export default function SmartNotes({ onClose, isEmbedded }: { onClose: () => void, isEmbedded?: boolean }) {
  const [note, setNote] = useState("# Research Notes\n\nStart typing your insights here...");

  const content = (
    <div className="flex-1 flex flex-col p-6 h-full">
      {!isEmbedded && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xs uppercase tracking-widest text-gray-400">Insights</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex-1 surface rounded-xl overflow-hidden border-white/[0.04]">
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-full bg-transparent border-none text-[14px] text-gray-300 resize-none focus:ring-0 p-4 font-mono leading-relaxed"
          placeholder="Capture your research insights here..."
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center px-2">
        <span className="text-[10px] font-bold text-gray-600 uppercase">{note.length} chars</span>
        <button className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
          Export
        </button>
      </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-80 border-l border-white/[0.04] bg-[#09090b] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}
