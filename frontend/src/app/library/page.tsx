"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function KnowledgeLibrary() {
  const [documents] = useState([
    { id: "1", name: "Q1-Strategy-Report.pdf", workspace: "Neural Networks", size: "2.4 MB", date: "May 12, 2026" },
    { id: "2", name: "Market-Trends-Analysis.pdf", workspace: "Market Trends", size: "1.1 MB", date: "May 10, 2026" },
    { id: "3", name: "Quantum-Computing-Whitepaper.pdf", workspace: "Quantum Computing", size: "5.8 MB", date: "May 08, 2026" },
    { id: "4", name: "Ethics-in-AI-Guidelines.pdf", workspace: "General", size: "0.9 MB", date: "May 05, 2026" },
  ]);

  const [search, setSearch] = useState("");

  return (
    <div className="flex h-screen bg-[#09090b] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Knowledge Library</h1>
              <p className="text-gray-500 font-medium">Search and manage all indexed research documents.</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search library..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0c0c0e] border border-white/5 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none w-64 transition-all"
              />
            </div>
          </header>

          <div className="bg-[#0c0c0e] border border-white/[0.04] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspace</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Size</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date Added</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {documents.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase())).map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{doc.workspace}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{doc.size}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black text-gray-700 hover:text-red-500 uppercase tracking-tighter transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
