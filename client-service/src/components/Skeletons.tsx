export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="skeleton w-2.5 h-2.5 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-3 space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-5 w-12 rounded" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-6 w-10 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
