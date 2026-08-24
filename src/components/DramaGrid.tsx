import { UnifiedDrama } from '@/types/drama';
import { DramaCard } from './DramaCard';
import { DramaCardSkeleton } from './DramaCardSkeleton';
import { Film } from 'lucide-react';

interface DramaGridProps {
  dramas: UnifiedDrama[];
  isLoading?: boolean;
  emptyMessage?: string;
  count?: number;
}

export function DramaGrid({
  dramas,
  isLoading = false,
  emptyMessage = 'Tidak ada drama ditemukan.',
  count = 12,
}: DramaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: count }).map((_, idx) => (
          <DramaCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!dramas || dramas.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center text-zinc-400 bg-zinc-900/20 rounded-2xl border border-zinc-800/40 p-6">
        <Film className="w-12 h-12 text-zinc-600 mb-3" />
        <p className="text-sm font-medium text-zinc-300">{emptyMessage}</p>
        <p className="text-xs text-zinc-500 mt-1">Coba ganti kategori atau provider lain.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {dramas.map((drama, idx) => (
        <DramaCard key={`${drama.provider}-${drama.id}-${idx}`} drama={drama} priority={idx < 4} />
      ))}
    </div>
  );
}
