"use client";

export default function LoadingSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-end mb-16">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-white/5 rounded-md" />
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
          <div className="h-3 w-48 bg-white/5 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-28 bg-white/5 rounded-xl" />
          <div className="h-12 w-28 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 bg-[#0c0c0e]/80 border border-white/[0.04] rounded-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-white/10" />
              <div className="space-y-1.5 flex flex-col items-end">
                <div className="h-2 w-12 bg-white/5 rounded" />
                <div className="h-3 w-8 bg-white/5 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-white/10 rounded" />
              <div className="flex items-center gap-3">
                <div className="h-1 flex-1 bg-white/5 rounded-full" />
                <div className="h-2 w-10 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity pulse skeleton */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-white/10 rounded-full" />
          <div className="h-3 w-32 bg-white/5 rounded" />
        </div>
        <div className="bg-[#0c0c0e]/50 border border-white/[0.04] rounded-2xl p-6 h-[200px] flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 bg-white/10 rounded" />
              <div className="h-2 w-12 bg-white/5 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/2 bg-white/10 rounded" />
              <div className="h-2 w-16 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
