"use client";

export default function LandingPreview() {
  return (
    <div className="h-full w-full bg-[#0a0a0b] flex overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-16 md:w-56 border-r border-white/5 bg-[#0d0d0f] flex flex-col p-4 gap-6">
        <div className="w-full h-8 rounded-lg bg-white/5" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20" />
              <div className="flex-1 h-3 rounded-full bg-white/5 hidden md:block" />
            </div>
          ))}
        </div>
      </div>

      {/* Mini Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0b]">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
          <div className="w-32 h-4 rounded-full bg-white/5" />
          <div className="flex gap-2">
            <div className="w-16 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
            <div className="w-16 h-7 rounded-full bg-white/5" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-24 h-3 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-white/5 w-full" />
                <div className="h-3 rounded-full bg-white/5 w-[90%]" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1 items-end">
              <div className="w-20 h-3 rounded-full bg-white/10" />
              <div className="space-y-2 w-full">
                <div className="h-3 rounded-full bg-indigo-500/20 w-full" />
                <div className="h-3 rounded-full bg-indigo-500/20 w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Agent Activity Mock */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex gap-4 overflow-hidden">
          <div className="min-w-[180px] h-16 rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="w-12 h-2 rounded-full bg-blue-400/30" />
              <div className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <div className="w-full h-1 bg-blue-400/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 w-2/3" />
            </div>
          </div>
          <div className="min-w-[180px] h-16 rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="w-12 h-2 rounded-full bg-purple-400/30" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="w-full h-1 bg-purple-400/20 rounded-full" />
          </div>
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-white/5">
          <div className="w-full h-12 rounded-xl bg-white/5 border border-white/10" />
        </div>
      </div>

      {/* Mini PDF Sidebar */}
      <div className="w-64 border-l border-white/5 bg-[#0d0d0f] hidden xl:flex flex-col p-6 gap-6">
        <div className="w-24 h-4 rounded-full bg-white/10" />
        <div className="w-full h-32 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5" />
          <div className="w-20 h-2 rounded-full bg-white/5" />
        </div>
        <div className="space-y-4">
           {[1, 2].map((i) => (
             <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3 items-center">
               <div className="w-6 h-6 rounded bg-red-400/20" />
               <div className="flex-1 space-y-2">
                 <div className="w-20 h-2 rounded-full bg-white/10" />
                 <div className="w-12 h-2 rounded-full bg-white/5" />
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
