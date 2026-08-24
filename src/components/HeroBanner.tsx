import Link from 'next/link';
import Image from 'next/image';
import { Play, Info, Sparkles, Bookmark } from 'lucide-react';
import { UnifiedDrama } from '@/types/drama';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';

interface HeroBannerProps {
  drama?: UnifiedDrama | null;
}

export function HeroBanner({ drama }: HeroBannerProps) {
  const { toggleBookmark, isBookmarked } = useLocalLibrary();

  if (!drama) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
    );
  }

  const bookmarked = isBookmarked(drama.id, drama.provider);

  return (
    <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
      {/* Background Poster / Backdrop */}
      <Image
        src={drama.cover}
        alt={drama.title}
        fill
        priority
        className="object-cover object-center filter brightness-60 scale-105"
      />

      {/* Modern Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090c]/90 via-[#09090c]/40 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-end max-w-2xl">
        
        {/* Provider & Spotlight Tag */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-red-400" />
            Spotlight
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700 backdrop-blur-md uppercase tracking-wider">
            {drama.provider}
          </span>
          {drama.totalEpisodes ? (
            <span className="text-xs text-zinc-400 font-medium">
              {drama.totalEpisodes} Episode
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight line-clamp-2 drop-shadow-md">
          {drama.title}
        </h1>

        {/* Synopsis */}
        {drama.description && (
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 mt-2 mb-4 max-w-xl text-zinc-300/90 drop-shadow">
            {drama.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href={`/watch/${drama.provider}/${drama.id}?ep=1`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Nonton Sekarang</span>
          </Link>

          <Link
            href={`/drama/${drama.provider}/${drama.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700/80 backdrop-blur-md transition-all"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Detail Drama</span>
          </Link>

          <button
            onClick={() => toggleBookmark(drama)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              bookmarked
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80'
            }`}
            title={bookmarked ? 'Hapus dari koleksi' : 'Tambah ke koleksi'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-red-400' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
