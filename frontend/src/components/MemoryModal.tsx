"use client";
import { useState } from "react";

export default function MemoryModal({ onClose }: { onClose: () => void }) {
  const [memories, setMemories] = useState([
    { id: 1, fact: "User prefers concise, bullet-point summaries." },
    { id: 2, fact: "User is working on a machine learning project for NSoC'26." },
    { id: 3, fact: "Always use Tailwind CSS for UI components." }
  ]);

  const deleteMemory = (id: number) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <h2 className="text-lg font-semibold text-white">AI Memory</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-400">
            Lexicon AI learns about your preferences over time to provide better answers. You can manage or delete learned facts here.
          </p>
          
          <div className="flex flex-col gap-2 mt-2">
            {memories.length === 0 ? (
              <div className="text-center p-6 text-sm text-gray-500 border border-dashed border-white/10 rounded-xl">
                No memories found.
              </div>
            ) : (
              memories.map((memory) => (
                <div key={memory.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                  <span className="text-sm text-gray-300">{memory.fact}</span>
                  <button 
                    onClick={() => deleteMemory(memory.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none"
                    aria-label="Forget this fact"
                    title="Forget memory"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
