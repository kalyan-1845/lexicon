"use client";

export default function AgentWorkflow() {
  const agents = [
    { name: "Researcher", active: true },
    { name: "Analyst", active: true },
    { name: "Writer", active: false },
  ];

  return (
    <div className="flex gap-4 items-center justify-center py-2 opacity-50">
      {agents.map((agent, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 group">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-1 rounded-full ${agent.active ? 'bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${agent.active ? 'text-gray-300' : 'text-gray-600'}`}>
              {agent.name}
            </span>
          </div>
          {agent.active && (
            <span className="text-[8px] font-black text-green-500/40 uppercase tracking-tighter animate-in fade-in slide-in-from-top-1 duration-500">
              {i === 0 ? "Fact-Finding..." : i === 1 ? "Analyzing..." : "Finalizing..."}
            </span>
          )}
        </div>
      ))}

    </div>
  );
}
