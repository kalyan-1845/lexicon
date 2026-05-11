"use client";
import { useState } from "react";

export default function ChatArea() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] relative">
      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-8 flex flex-col gap-6"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* AI Welcome Message */}
        <div className="flex gap-4 max-w-3xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-sm font-semibold text-gray-200">Lexicon Assistant</span>
            <p className="text-gray-300 text-sm leading-relaxed">
              Hello! I'm your AI research assistant. You can upload a PDF document using the panel on the right, and then ask me any questions about it.
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Ask anything about your research..."
            placeholder="Ask anything about your research..." 
            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
          />
          <button aria-label="Send message" className="absolute right-2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">Lexicon AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
}
