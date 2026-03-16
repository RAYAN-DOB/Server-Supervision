export default function SitesLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-48 rounded-xl bg-white/[0.05] mb-2" />
        <div className="h-4 w-64 rounded-lg bg-white/[0.03]" />
      </div>

      {/* Filters bar skeleton */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="h-10 w-64 rounded-xl bg-white/[0.04]" />
        <div className="h-10 w-32 rounded-xl bg-white/[0.04]" />
        <div className="h-10 w-36 rounded-xl bg-white/[0.04]" />
        <div className="ml-auto h-10 w-24 rounded-xl bg-white/[0.04]" />
      </div>

      {/* Stats bar skeleton */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        ))}
      </div>

      {/* Table header skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04]">
          {[180, 140, 100, 100, 120, 100, 80].map((w, i) => (
            <div key={i} className="h-4 rounded-md bg-white/[0.05]" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows skeleton */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.03]"
          >
            <div className="h-4 rounded-md bg-white/[0.04]" style={{ width: 180 }} />
            <div className="h-4 rounded-md bg-white/[0.03]" style={{ width: 140 }} />
            <div className="h-5 w-20 rounded-full bg-white/[0.04]" />
            <div className="h-5 w-20 rounded-full bg-white/[0.04]" />
            <div className="h-5 w-24 rounded-full bg-white/[0.04]" />
            <div className="h-4 w-16 rounded-md bg-white/[0.03]" />
            <div className="h-4 w-12 rounded-md bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
