'use client';

import React from 'react';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { StreamerAvatar } from '@/components/StreamerAvatar';
import { Radio, RefreshCw, Trash2, Plus } from 'lucide-react';

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
  // Sort: LIVE streamers first
  const sortedStreamers = [...streamers].sort((a, b) => {
    const aLive = statuses[a.handle.toLowerCase()]?.isLive ? 1 : 0;
    const bLive = statuses[b.handle.toLowerCase()]?.isLive ? 1 : 0;
    return bLive - aLive;
  });

  const liveCount = Object.values(statuses).filter((s) => s.isLive).length;

  return (
    <div className="w-full space-y-2.5">
      {/* Top Info Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="neo-badge bg-[var(--accent-yellow)]">
            <Radio className="w-3.5 h-3.5 text-[#18181b] animate-pulse" />
            <span className="text-[#18181b] font-bold">{liveCount} Live Sekarang</span>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-bold hidden sm:inline">
            Pilih streamer untuk langsung menonton:
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-[8px] bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] text-[var(--text-main)] hover:-translate-y-0.5 transition-transform active:translate-y-0.5 disabled:opacity-50"
              title="Perbarui Status Live"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="neo-btn neo-btn-mint text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Streamer</span>
          </button>
        </div>
      </div>

      {/* Streamers Horizontal Scroll Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {sortedStreamers.map((streamer) => {
          const status = statuses[streamer.handle.toLowerCase()];
          const isLive = status?.isLive;
          const isActive = streamer.id === activeStreamerId;
          const avatarUrl = streamer.avatar || (status?.avatar?.includes('yt3.') ? status.avatar : null);

          return (
            <button
              key={streamer.id}
              onClick={() => onSelectStreamer(streamer.id)}
              className={`group relative shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] border-[2.5px] border-[var(--border-color)] transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[var(--primary)] text-[#18181b] shadow-[4px_4px_0px_var(--shadow-color)] -translate-y-1'
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]'
              }`}
            >
              {/* Resilient Avatar Container */}
              <StreamerAvatar
                name={streamer.name}
                avatarUrl={avatarUrl}
                size="md"
                isLive={isLive}
              />

              {/* Streamer Name & Status */}
              <div className="flex flex-col min-w-[85px] max-w-[135px]">
                <span className={`font-black text-xs truncate ${isActive ? 'text-[#18181b]' : 'text-[var(--text-main)]'}`}>
                  {streamer.name}
                </span>

                {isLive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--accent-red)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  <span className={`text-[10px] font-bold ${isActive ? 'text-[#52525b]' : 'text-[var(--text-muted)]'}`}>
                    Offline
                  </span>
                )}
              </div>

              {/* Delete custom streamer */}
              {streamer.isCustom && onRemoveStreamer && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStreamer(streamer.id);
                  }}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-black/10 transition-colors"
                  title="Hapus streamer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
