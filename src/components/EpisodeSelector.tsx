'use client';

import { useState } from 'react';
import { UnifiedEpisode } from '@/types/drama';
import { Play, Check, Search, X } from 'lucide-react';

interface EpisodeSelectorProps {
  episodes: UnifiedEpisode[];
  totalEpisodes?: number;
  currentEpisodeNumber: number;
  onSelectEpisode: (episodeNumber: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function EpisodeSelector({
  episodes,
  totalEpisodes = 1,
  currentEpisodeNumber,
  onSelectEpisode,
  isOpen = true,
  onClose,
}: EpisodeSelectorProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const count = episodes.length > 0 ? episodes.length : totalEpisodes;
  const list = Array.from({ length: count }, (_, i) => {
    const epNum = i + 1;
    const epData = episodes[i];
    return {
      episodeNumber: epNum,
      title: epData?.title || `Episode ${epNum}`,
      id: epData?.id || epNum,
    };
  });

  const filtered = list.filter((item) => {
    if (!filterQuery) return true;
    return (
      item.episodeNumber.toString().includes(filterQuery) ||
      item.title.toLowerCase().includes(filterQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base text-white">
            Daftar Episode
          </h3>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
            {count} Ep
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Episode Filter Input (for dramas with 50-100 episodes) */}
      {count > 20 && (
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="number"
            placeholder="Lompat ke episode..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      )}

      {/* Episode Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
        {filtered.map((item) => {
          const isActive = item.episodeNumber === currentEpisodeNumber;
          return (
            <button
              key={item.episodeNumber}
              onClick={() => onSelectEpisode(item.episodeNumber)}
              className={`relative flex items-center justify-center h-10 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                  : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 border border-zinc-700/40'
              }`}
            >
              <span>{item.episodeNumber}</span>
              {isActive && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
