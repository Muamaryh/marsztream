import Link from 'next/link';
import Image from 'next/image';
import { Play, Eye, Film } from 'lucide-react';
import { UnifiedDrama, DramaProvider } from '@/types/drama';
import { formatNumber } from '@/lib/utils';

interface DramaCardProps {
  drama: UnifiedDrama;
  priority?: boolean;
}

const PROVIDER_COLORS: Record<DramaProvider, { bg: string; text: string; label: string }> = {
  dramabox: { bg: 'bg-purple-950/80 border-purple-500/30', text: 'text-purple-300', label: 'DramaBox' },
  pinedrama: { bg: 'bg-emerald-950/80 border-emerald-500/30', text: 'text-emerald-300', label: 'PineDrama' },
  reelshort: { bg: 'bg-amber-950/80 border-amber-500/30', text: 'text-amber-300', label: 'ReelShort' },
  shortmax: { bg: 'bg-cyan-950/80 border-cyan-500/30', text: 'text-cyan-300', label: 'ShortMax' },
  melolo: { bg: 'bg-blue-950/80 border-blue-500/30', text: 'text-blue-300', label: 'Melolo' },
  freereels: { bg: 'bg-pink-950/80 border-pink-500/30', text: 'text-pink-300', label: 'FreeReels' },
  dramanova: { bg: 'bg-rose-950/80 border-rose-500/30', text: 'text-rose-300', label: 'DramaNova' },
};

export function DramaCard({ drama, priority = false }: DramaCardProps) {
  const providerMeta = PROVIDER_COLORS[drama.provider] || {
    bg: 'bg-zinc-800/80 border-zinc-700',
    text: 'text-zinc-300',
    label: drama.provider,
  };

  return (
    <Link
      href={`/drama/${drama.provider}/${drama.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/40 border border-white/[0.05] hover:border-red-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1"
    >
      {/* Poster Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        <Image
          src={drama.cover}
          alt={drama.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // fallback placeholder if image fails to load
            (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="%2318181b"><rect width="300" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2371717a" font-family="sans-serif" font-size="16">No Image</text></svg>';
          }}
        />

        {/* Gradient Overlay on Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Provider Tag (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md ${providerMeta.bg} ${providerMeta.text}`}>
            {providerMeta.label}
          </span>
        </div>

        {/* Total Episodes (Top Right) */}
        {drama.totalEpisodes ? (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
              <Film className="w-2.5 h-2.5 text-zinc-400" />
              {drama.totalEpisodes} Ep
            </span>
          </div>
        ) : null}

        {/* Hover Play Button (Centered) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Views / Tag info (Bottom of Poster) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-zinc-300 z-10">
          {drama.views ? (
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-medium">
              <Eye className="w-3 h-3 text-zinc-400" />
              {typeof drama.views === 'number' ? formatNumber(drama.views) : drama.views}
            </span>
          ) : <div />}

          {drama.tags && drama.tags.length > 0 && (
            <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[50%]">
              {drama.tags[0]}
            </span>
          )}
        </div>
      </div>

      {/* Drama Title & Info */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1">
        <h3 className="font-semibold text-xs sm:text-sm text-zinc-100 line-clamp-2 group-hover:text-red-400 transition-colors leading-tight">
          {drama.title}
        </h3>
        
        {drama.description && (
          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
            {drama.description}
          </p>
        )}
      </div>
    </Link>
  );
}
