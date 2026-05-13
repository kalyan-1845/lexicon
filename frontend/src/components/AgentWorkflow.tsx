"use client";

type AgentWorkflowProps = {
  activeAgent?: string | null;
  statusMessage?: string | null;
};

export default function AgentWorkflow({ activeAgent, statusMessage }: AgentWorkflowProps) {
  const agents = [
    { name: "Researcher", label: "Fact-Finding" },
    { name: "Analyst", label: "Analyzing" },
    { name: "Lexicon", label: "Finalizing" },
  ];

  return (
    <div className="flex gap-6 items-center justify-center py-2 border-t border-white/[0.02] bg-white/[0.01]">
      {agents.map((agent, i) => {
        const isActive = activeAgent === agent.name;
        return (
          <div key={i} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${isActive ? 'scale-105 opacity-100' : 'opacity-30 scale-95'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-gray-700'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {agent.name}
              </span>
            </div>
            {isActive && statusMessage && (
              <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter animate-in fade-in slide-in-from-top-1 duration-500">
                {statusMessage}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
