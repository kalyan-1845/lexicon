"use client";

export default function LandingPreview() {
  return (
    <div className="h-full w-full bg-[var(--theme-bg)] flex overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-16 md:w-56 border-r border-[var(--theme-border)] bg-[#0d0d0f] flex flex-col p-4 gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--theme-text)]">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-xs tracking-tight hidden md:block">Lexicon AI</span>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20" />
              <div className="flex-1 h-3 rounded-full bg-[var(--theme-border)] hidden md:block" />
            </div>
          ))}
        </div>
      </div>

      {/* Mini Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[var(--theme-bg)]">
        {/* Header */}
        <div className="h-14 border-b border-[var(--theme-border)] flex items-center justify-between px-6">
          <div className="w-32 h-4 rounded-full bg-[var(--theme-border)]" />
          <div className="flex gap-2">
            <div className="w-16 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
            <div className="w-16 h-7 rounded-full bg-[var(--theme-border)]" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-24 h-3 rounded-full bg-[var(--theme-border)]" />
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-[var(--theme-border)] w-full" />
                <div className="h-3 rounded-full bg-[var(--theme-border)] w-[90%]" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-border)] flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1 items-end">
              <div className="w-20 h-3 rounded-full bg-[var(--theme-border)]" />
              <div className="space-y-2 w-full">
                <div className="h-3 rounded-full bg-indigo-500/20 w-full" />
                <div className="h-3 rounded-full bg-indigo-500/20 w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Agent Activity Mock */}
        <div className="p-4 bg-[var(--theme-border)] border-t border-[var(--theme-border)] flex gap-4 overflow-hidden">
          <div className="min-w-[180px] h-16 rounded-xl bg-[var(--theme-border)] border border-[var(--theme-border)] p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="w-12 h-2 rounded-full bg-blue-400/30" />
              <div className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <div className="w-full h-1 bg-blue-400/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 w-2/3" />
            </div>
          </div>
          <div className="min-w-[180px] h-16 rounded-xl bg-[var(--theme-border)] border border-[var(--theme-border)] p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="w-12 h-2 rounded-full bg-purple-400/30" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="w-full h-1 bg-purple-400/20 rounded-full" />
          </div>
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-[var(--theme-border)]">
          <div className="w-full h-12 rounded-xl bg-[var(--theme-border)] border border-[var(--theme-border)]" />
        </div>
      </div>

      {/* Mini PDF Sidebar */}
      <div className="w-64 border-l border-[var(--theme-border)] bg-[#0d0d0f] hidden xl:flex flex-col p-6 gap-6">
        <div className="w-24 h-4 rounded-full bg-[var(--theme-border)]" />
        <div className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--theme-border)] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--theme-border)]" />
          <div className="w-20 h-2 rounded-full bg-[var(--theme-border)]" />
        </div>
        <div className="space-y-4">
           {[1, 2].map((i) => (
             <div key={i} className="p-3 rounded-lg bg-[var(--theme-border)] border border-[var(--theme-border)] flex gap-3 items-center">
               <div className="w-6 h-6 rounded bg-red-400/20" />
               <div className="flex-1 space-y-2">
                 <div className="w-20 h-2 rounded-full bg-[var(--theme-border)]" />
                 <div className="w-12 h-2 rounded-full bg-[var(--theme-border)]" />
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
