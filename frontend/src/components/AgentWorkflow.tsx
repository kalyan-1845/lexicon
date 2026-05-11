"use client";

export default function AgentWorkflow() {
  const agents = [
    { name: "Researcher", status: "Searching Web", active: true, color: "bg-blue-400" },
    { name: "Analyst", status: "Processing Context", active: true, color: "bg-purple-400" },
    { name: "Writer", status: "Idle", active: false, color: "bg-gray-600" },
  ];

  return (
    <div className="flex gap-4 items-center justify-center py-4 relative group">
      <div className="absolute inset-0 bg-white/[0.01] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      {agents.map((agent, i) => (
        <div 
          key={i} 
          className={`flex items-center gap-3 px-5 py-3 rounded-[20px] border transition-all duration-500 shadow-xl ${
            agent.active 
              ? "bg-white/[0.03] border-white/[0.08] shadow-black/40 scale-100" 
              : "bg-transparent border-transparent opacity-30 scale-95"
          }`}
        >
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${agent.color} ${agent.active ? 'animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`} />
            {agent.active && (
              <div className={`absolute inset-0 rounded-full ${agent.color} animate-ping opacity-20`} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{agent.name}</span>
            <span className={`text-[12px] font-semibold tracking-tight ${agent.active ? 'text-gray-200' : 'text-gray-600'}`}>
              {agent.status}
            </span>
          </div>
        </div>
      ))}
      
      {/* Connector lines (simplified) */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -z-10 pointer-events-none" />
    </div>
  );
}
