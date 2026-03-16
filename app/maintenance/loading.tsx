export default function MaintenanceLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="h-9 w-72 rounded-xl bg-white/[0.05] mb-2" />
          <div className="h-4 w-56 rounded-lg bg-white/[0.03]" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-white/[0.04]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-white/[0.04]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="w-2 h-2 rounded-full bg-white/[0.08]" />
            <div className="w-9 h-9 rounded-xl bg-white/[0.05]" />
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded-md bg-white/[0.06] mb-1.5" />
              <div className="h-3 w-1/2 rounded-md bg-white/[0.04]" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
