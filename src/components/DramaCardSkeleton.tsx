export function DramaCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-zinc-900/40 border border-white/[0.04] animate-pulse">
      {/* Poster Skeleton */}
      <div className="relative aspect-[3/4] w-full bg-zinc-800/60 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-zinc-700/40" />
      </div>

      {/* Title Skeleton */}
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-zinc-800/80 rounded w-5/6" />
        <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
      </div>
    </div>
  );
}
