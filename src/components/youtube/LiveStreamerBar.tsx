'use client';

import Image from 'next/image';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { Plus, Radio, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface LiveStreamerBarProps {
  streamers: Streamer[];
  activeStreamerId: string;
  statuses: Record<string, StreamerLiveStatus>;
  onSelectStreamer: (id: string) => void;
  onOpenAddModal: () => void;
  onRemoveStreamer?: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function LiveStreamerBar({
  streamers,
  activeStreamerId,
  statuses,
  onSelectStreamer,
  onOpenAddModal,
  onRemoveStreamer,
  onRefresh,
  isLoading = false,
}: LiveStreamerBarProps) {
  // Sort streamers so LIVE streamers appear first!
  const sortedStreamers = [...streamers].sort((a, b) => {
    const aLive = statuses[a.handle.toLowerCase()]?.isLive ? 1 : 0;
    const bLive = statuses[b.handle.toLowerCase()]?.isLive ? 1 : 0;
    return bLive - aLive;
  });

  const liveCount = Object.values(statuses).filter((s) => s.isLive).length;

  return (
    <div className="w-full space-y-3">
      {/* Header Info & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{liveCount} Sedang Live</span>
          </div>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Klik streamer untuk langsung menonton
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Perbarui Status Live"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm shadow-red-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Streamer</span>
          </button>
        </div>
      </div>

      {/* Streamers Horizontal Scroll Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {sortedStreamers.map((streamer) => {
          const status = statuses[streamer.handle.toLowerCase()];
          const isLive = status?.isLive;
          const isActive = streamer.id === activeStreamerId;
          const avatarUrl = status?.avatar || streamer.avatar;

          return (
            <button
              key={streamer.id}
              onClick={() => onSelectStreamer(streamer.id)}
              className={`group relative shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all duration-200 text-left ${
                isActive
                  ? 'bg-zinc-800/90 border-red-500 text-white shadow-lg shadow-red-500/10 scale-105'
                  : 'bg-zinc-900/60 hover:bg-zinc-800/70 border-zinc-800/80 text-zinc-300 hover:text-white'
              }`}
            >
              {/* Avatar Container with Live Pulsing Ring */}
              <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden bg-zinc-800">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={streamer.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">
                    {streamer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Live Red Ring */}
                {isLive && (
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Streamer Name & Status Badge */}
              <div className="flex flex-col min-w-[90px] max-w-[140px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs truncate">
                    {streamer.name}
                  </span>
                </div>

                {isLive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    Offline
                  </span>
                )}
              </div>

              {/* Remove button for custom streamers */}
              {streamer.isCustom && onRemoveStreamer && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStreamer(streamer.id);
                  }}
                  className="p-1 rounded-full text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Hapus streamer"
                >
                  <Trash2 className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
