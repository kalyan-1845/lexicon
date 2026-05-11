"use client";
import { useState, useEffect } from "react";

type AgentTask = {
  id: string;
  agent: string;
  status: "thinking" | "completed" | "error";
  task: string;
  color: string;
};

export default function AgentWorkflow() {
  const [tasks, setTasks] = useState<AgentTask[]>([
    { id: "1", agent: "Researcher", status: "completed", task: "Scanning PDF for key entities...", color: "text-blue-400" },
    { id: "2", agent: "Analyst", status: "thinking", task: "Cross-referencing market trends...", color: "text-purple-400" },
    { id: "3", agent: "Writer", status: "thinking", task: "Drafting executive summary...", color: "text-emerald-400" },
  ]);

  return (
    <div className="p-4 bg-[#0d0d0f] border-t border-white/5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Active Multi-Agent Workflow</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">3 Agents Active</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tasks.map((task) => (
          <div key={task.id} className="min-w-[240px] p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 transition-all hover:border-white/10">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${task.color}`}>{task.agent} Agent</span>
              {task.status === "thinking" ? (
                <span className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-300 truncate">{task.task}</p>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${task.status === 'completed' ? 'bg-emerald-500 w-full' : 'bg-indigo-500 w-1/3 animate-pulse'}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
