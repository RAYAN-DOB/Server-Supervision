export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="h-9 w-56 rounded-xl bg-white/[0.05] mb-2" />
          <div className="h-4 w-40 rounded-lg bg-white/[0.03]" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-white/[0.04]" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-[136px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
              <div className="w-20 h-4 rounded-lg bg-white/[0.04]" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-white/[0.06] mb-1.5" />
            <div className="h-4 w-32 rounded-md bg-white/[0.04] mb-1" />
            <div className="h-3 w-28 rounded-md bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart skeleton */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-44 rounded-lg bg-white/[0.05] mb-1.5" />
              <div className="h-3 w-36 rounded-md bg-white/[0.03]" />
            </div>
            <div className="h-4 w-20 rounded-md bg-white/[0.04]" />
          </div>
          <div className="flex items-end gap-1 h-48 mt-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-purple-500/[0.08]"
                style={{ height: `${30 + Math.sin(i / 3) * 25 + 20}%` }}
              />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-[180px]">
            <div className="h-5 w-28 rounded-lg bg-white/[0.05] mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/[0.03]" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-[180px]">
            <div className="h-5 w-28 rounded-lg bg-white/[0.05] mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/[0.03]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-[280px]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="h-5 w-36 rounded-lg bg-white/[0.05]" />
              <div className="h-4 w-16 rounded-md bg-white/[0.03]" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                  <div className="w-2 h-2 rounded-full bg-white/[0.08]" />
                  <div className="flex-1">
                    <div className="h-4 rounded-md bg-white/[0.06] mb-1 w-3/4" />
                    <div className="h-3 rounded-md bg-white/[0.03] w-1/2" />
                  </div>
                  <div className="w-16 h-5 rounded-md bg-white/[0.05]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
