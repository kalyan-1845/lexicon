"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [workspaces] = useState([
    { id: "1", name: "Neural Networks", docs: 12, lastActive: "2h ago" },
    { id: "2", name: "Market Trends 2026", docs: 5, lastActive: "5h ago" },
    { id: "3", name: "Quantum Computing", docs: 24, lastActive: "1d ago" },
  ]);

  return (
    <div className="flex h-screen bg-[#09090b] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Research Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your knowledge base and active workspaces.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div key={ws.id} className="group p-6 bg-[#0c0c0e] border border-white/[0.04] rounded-xl hover:border-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{ws.lastActive}</span>
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">{ws.name}</h3>
                <p className="text-sm text-gray-500">{ws.docs} Documents indexed</p>
              </div>
            ))}
            
            <button className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl hover:bg-white/[0.02] transition-all group">
              <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3 group-hover:border-white/40 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">New Workspace</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
