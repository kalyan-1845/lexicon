"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ShortcutsCheatSheet from "@/components/ShortcutsCheatSheet";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces] = useState([
    { id: "1", name: "Neural Networks", docs: 12, lastActive: "2h ago", color: "from-indigo-500 to-purple-600" },
    { id: "2", name: "Market Trends 2026", docs: 5, lastActive: "5h ago", color: "from-emerald-500 to-teal-600" },
    { id: "3", name: "Quantum Computing", docs: 24, lastActive: "1d ago", color: "from-amber-500 to-orange-600" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // LEVEL 3 FEATURE: Real-Time Collaborative Ecosystem State
  const [collaborators] = useState([
    { id: "c1", name: "Sarah J.", avatar: "SJ", color: "bg-blue-500", status: "Editing Neural Networks" },
    { id: "c2", name: "Agent Analyst", avatar: "🤖", color: "bg-purple-500", status: "Synthesizing Quantum data" },
    { id: "c3", name: "David M.", avatar: "DM", color: "bg-emerald-500", status: "Uploading Market Trends" },
  ]);

  const [activities, setActivities] = useState([
    { id: "a1", user: "Sarah J.", action: "created new note in", target: "Neural Networks", time: "Just now", type: "user" },
    { id: "a2", user: "Agent Researcher", action: "indexed 5 new PDFs for", target: "Market Trends 2026", time: "2m ago", type: "agent" },
    { id: "a3", user: "David M.", action: "resolved conflict in", target: "Quantum Computing", time: "15m ago", type: "user" },
  ]);

  // Simulate real-time incoming events for the collaborative pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = [
        { id: Date.now().toString(), user: "Agent Fact-Checker", action: "verified citations in", target: "Neural Networks", time: "Just now", type: "agent" },
        { id: Date.now().toString(), user: "Sarah J.", action: "commented on", target: "Market Trends 2026", time: "Just now", type: "user" },
        { id: Date.now().toString(), user: "Agent Writer", action: "drafted summary for", target: "Quantum Computing", time: "Just now", type: "agent" }
      ];
      const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)];
      setActivities(prev => [randomEvent, ...prev].slice(0, 5)); // keep last 5
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      <Sidebar 
        workspaces={[]} 
        activeWorkspace="" 
        onWorkspaceChange={() => {}} 
        onAddWorkspace={() => {}} 
        collections={[]} 
        activeCollection={null} 
        onCollectionChange={() => {}} 
        onAddCollection={() => {}} 
      />
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Luxury Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto p-12 relative z-10">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <header className="mb-16 flex justify-between items-end">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-indigo-500/80 uppercase tracking-[0.2em]">Collaborative Workspace</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, <span className="text-gray-500">Alex</span></h1>
              <p className="text-gray-500 font-medium text-sm">Your agentic workspace is ready for deep analysis.</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-700">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Global Documents</span>
                    <span className="text-xl font-extrabold text-gray-200">142</span>
                  </div>
                  <div className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Live Sync</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-xl font-extrabold text-green-500">Active</span>
                    </div>
                  </div>
              </div>
              
              {/* Active Collaborators Avatar Stack */}
              <div className="flex items-center gap-3 bg-[#0c0c0e]/80 border border-white/[0.04] rounded-full px-4 py-1.5 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Now:</span>
                <div className="flex -space-x-2">
                  {collaborators.map((c) => (
                    <div key={c.id} title={c.status} className={`w-8 h-8 rounded-full ${c.color} border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold shadow-lg cursor-pointer hover:-translate-y-1 transition-transform relative group`}>
                      {c.avatar}
                      {/* Tooltip */}
                      <div className="absolute top-10 w-max px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {c.name} - {c.status}
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span className="text-[9px] font-extrabold text-gray-600 uppercase tracking-widest mb-1">Last Active</span>
                      <span className="text-[10px] font-bold text-gray-400">{ws.lastActive}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors">{ws.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-1 flex-1 bg-white/[0.03] rounded-full overflow-hidden">
                      <div className="h-full bg-white/10 w-2/3 group-hover:bg-white/20 transition-all" />
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-tighter">{ws.docs} Sources</span>
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
              <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-widest">Initialize New Workspace</span>
            </button>
          </div>

          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3 bg-indigo-500 rounded-full" />
              <h2 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-[0.2em]">Real-Time Collaboration Pulse</h2>
            </div>
            
            <div className="bg-[#0c0c0e]/50 backdrop-blur-md border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span> Live
                 </span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-white/[0.02] rounded-xl transition-colors border border-transparent hover:border-white/5 animate-in fade-in slide-in-from-top-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'agent' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                       {activity.type === 'agent' ? '🤖' : '👤'}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-gray-200">
                         <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="font-bold text-indigo-400 cursor-pointer hover:underline">{activity.target}</span>
                       </p>
                       <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          </>
          )}
        </div>
      </main>
      <ShortcutsCheatSheet />
    </div>
  );
}
