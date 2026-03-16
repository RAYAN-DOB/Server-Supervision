export default function AnalyticsLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-9 w-44 rounded-xl bg-white/[0.05] mb-2" />
          <div className="h-4 w-52 rounded-lg bg-white/[0.03]" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-[110px]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05]" />
              <div className="w-12 h-3 rounded-md bg-white/[0.04]" />
            </div>
            <div className="h-7 w-24 rounded-lg bg-white/[0.06] mb-1" />
            <div className="h-3 w-20 rounded-md bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-[280px]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="h-5 w-40 rounded-lg bg-white/[0.05]" />
              <div className="h-4 w-20 rounded-md bg-white/[0.03]" />
            </div>
            {/* Bar chart skeleton */}
            <div className="flex items-end gap-2 h-36 mt-2">
              {Array.from({ length: 12 }).map((_, j) => (
                <div
                  key={j}
                  className="flex-1 rounded-t-sm bg-purple-500/[0.08]"
                  style={{ height: `${20 + ((j * 17 + i * 7) % 70)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
