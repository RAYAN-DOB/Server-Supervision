export default function AlertesLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-9 w-52 rounded-xl bg-white/[0.05] mb-2" />
        <div className="h-4 w-48 rounded-lg bg-white/[0.03]" />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { color: "red" },
          { color: "orange" },
          { color: "yellow" },
          { color: "blue" },
        ].map(({ color }, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-white/[0.04]" />
        ))}
      </div>

      {/* Alert list skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            {/* Severity dot */}
            <div className="w-3 h-3 rounded-full bg-white/[0.08] flex-shrink-0" />
            {/* Left border accent */}
            <div className="w-1 h-12 rounded-full bg-white/[0.06] flex-shrink-0" />
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="h-4 rounded-md bg-white/[0.06] mb-1.5 w-3/4" />
              <div className="h-3 rounded-md bg-white/[0.04] w-1/2" />
            </div>
            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-5 w-16 rounded-md bg-white/[0.05]" />
              <div className="h-4 w-20 rounded-md bg-white/[0.03]" />
              <div className="h-8 w-24 rounded-xl bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
