"use client";
import { useState } from "react";
import PDFUploader from "./PDFUploader";
import SmartNotes from "./SmartNotes";

type RightSidebarProps = {
  activeTab: "docs" | "notes";
  setActiveTab: (tab: "docs" | "notes") => void;
  onContextUpdate: (text: string | null) => void;
  onClose: () => void;
};

export default function RightSidebar({ activeTab, setActiveTab, onContextUpdate, onClose }: RightSidebarProps) {
  return (
    <aside className="w-80 border-l border-white/[0.04] bg-[#09090b] h-full flex flex-col shrink-0">
      <div className="h-12 border-b border-white/[0.04] flex items-center px-4 justify-between bg-[#09090b]/50">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("docs")}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "docs" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Knowledge
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "notes" ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Insights
          </button>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "docs" ? (
          <PDFUploader onContextUpdate={onContextUpdate} isEmbedded />
        ) : (
          <SmartNotes onClose={onClose} isEmbedded />
        )}
      </div>
    </aside>
  );
}
