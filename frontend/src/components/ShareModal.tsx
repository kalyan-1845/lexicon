"use client";
import { useState } from "react";

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const shareUrl = "https://lexicon.ai/w/b8f9-42a1-xc9";

  const handleCopy = () => {
    if (!isPublic) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-sm surface rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workspace Sharing</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold text-gray-100">Public Link Access</span>
              <span className="text-[11px] text-gray-500">Allow anyone with the link to view</span>
            </div>
            <button 
              onClick={() => setIsPublic(!isPublic)}
              className={`w-9 h-5 rounded-full transition-all flex items-center px-1 ${
                isPublic ? 'bg-white' : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`w-3 h-3 rounded-full transition-all ${
                isPublic ? 'bg-black translate-x-4' : 'bg-gray-600'
              }`} />
            </button>
          </div>

          <div className={`space-y-3 transition-all duration-300 ${isPublic ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="flex items-center gap-2 p-1.5 bg-[#18181b] border border-white/5 rounded-lg">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-1 bg-transparent border-none text-[12px] text-gray-400 focus:ring-0 truncate px-2"
              />
              <button 
                onClick={handleCopy}
                disabled={!isPublic}
                className="btn-primary py-1 px-3 !text-[11px] h-7"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 font-medium italic text-center">
              {isPublic 
                ? "Visibility: Public. Anyone with this link can view research notes and chat history." 
                : "Visibility: Private. Link sharing is disabled."}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/[0.04] flex justify-end">
          <button onClick={onClose} className="btn-secondary">Done</button>
        </div>
      </div>
    </div>
  );
}
