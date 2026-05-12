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
        <div key={i} className="flex items-center gap-2">
          <div className={`w-1 h-1 rounded-full ${agent.active ? 'bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${agent.active ? 'text-gray-300' : 'text-gray-600'}`}>
            {agent.name}
          </span>
        </div>
      ))}

    </div>
  );
}
