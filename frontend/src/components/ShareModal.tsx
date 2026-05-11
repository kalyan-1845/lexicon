"use client";
import { useState } from "react";

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://lexicon.ai/w/b8f9-42a1-xc9";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Share Workspace</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-300">
            Anyone with this link will be able to view your AI chats and uploaded documents.
          </p>
          
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
            />
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">Public Access</span>
              <span className="text-xs text-gray-500">Allow guests to read this workspace</span>
            </div>
            <div className="w-10 h-6 bg-indigo-500 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm transition-transform"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
