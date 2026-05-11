"use client";
import { useState } from "react";

export default function PDFUploader() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <aside aria-label="Document Sources" className="w-80 border-l border-white/5 bg-[#0a0a0b] h-full flex flex-col hidden lg:flex p-4">
      <h2 className="font-semibold text-gray-200 mb-4">Document Sources</h2>
      
      {/* Upload Zone */}
      <div 
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF. Drag and drop or click to browse."
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
          isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Handle file drop later */ }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger file input click eventually
          }
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-3">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-200 mb-1">Upload a PDF</p>
        <p className="text-xs text-gray-500 mb-4">Drag and drop or click to browse</p>
        <button tabIndex={-1} aria-hidden="true" className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-[#0a0a0b] hover:bg-gray-200 transition-colors pointer-events-none">
          Browse Files
        </button>
      </div>

      {/* Active Documents List */}
      <nav aria-label="Active Documents" className="mt-6">
        <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Active Documents</h3>
        <ul className="space-y-2">
          <li className="p-3 rounded-lg bg-gray-900 border border-white/5 flex items-center gap-3">
             <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 shrink-0">
             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
             <polyline points="14 2 14 8 20 8"></polyline>
           </svg>
           <div className="flex flex-col overflow-hidden">
             <span className="text-sm text-gray-200 truncate">Machine_Learning_Ch1.pdf</span>
             <span className="text-xs text-gray-500">2.4 MB • Waiting...</span>
           </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
