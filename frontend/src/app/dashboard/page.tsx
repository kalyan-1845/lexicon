"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [workspaces] = useState([
    { id: "1", name: "Neural Networks", docs: 12, lastActive: "2h ago", color: "from-indigo-500 to-purple-600" },
    { id: "2", name: "Market Trends 2026", docs: 5, lastActive: "5h ago", color: "from-emerald-500 to-teal-600" },
    { id: "3", name: "Quantum Computing", docs: 24, lastActive: "1d ago", color: "from-amber-500 to-orange-600" },
  ]);

  return (
    <div className="flex h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Luxury Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto p-12 relative z-10">
          <header className="mb-16 flex justify-between items-end">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.2em]">Researcher Hub</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, <span className="text-gray-500">Alex</span></h1>
              <p className="text-gray-500 font-medium text-sm">Your agentic workspace is ready for deep analysis.</p>
            </div>
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-700">
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Global Documents</span>
                 <span className="text-xl font-black text-gray-200">142</span>
               </div>
               <div className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">API Health</span>
                 <span className="text-xl font-black text-green-500">99.9%</span>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {workspaces.map((ws, i) => (
              <div 
                key={ws.id} 
                style={{ animationDelay: `${i * 100}ms` }}
                className="group relative p-8 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/[0.04] rounded-2xl hover:border-white/10 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ws.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Last Active</span>
                      <span className="text-[10px] font-bold text-gray-400">{ws.lastActive}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-white transition-colors">{ws.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-1 flex-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <div className="h-full bg-white/10 w-2/3 group-hover:bg-white/20 transition-all" />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{ws.docs} Sources</span>
                  </div>
                </div>
              </div>
            ))}
            
            <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-2xl hover:bg-white/[0.02] hover:border-white/10 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-white/20 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-gray-400 transition-colors">
                  <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Initialize New Workspace</span>
            </button>
          </div>

          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3 bg-indigo-500 rounded-full" />
              <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Recent Activity Pulse</h2>
            </div>
            <div className="bg-[#0c0c0e]/50 backdrop-blur-md border border-white/[0.04] rounded-2xl p-2">
              <div className="h-[200px] w-full bg-[#09090b]/50 rounded-xl border border-white/5 flex items-center justify-center">
                 <p className="text-xs font-bold text-gray-700 uppercase tracking-widest animate-pulse">Establishing Neural Connection...</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
