'use client';

import { useState } from 'react';
import { Streamer, StreamerLiveStatus, MultiViewLayout } from '@/types/streamer';
import { LayoutGrid, Columns, Square, LayoutTemplate, X, Radio } from 'lucide-react';

interface MultiViewGridProps {
  streamers: Streamer[];
  statuses: Record<string, StreamerLiveStatus>;
  layout: MultiViewLayout;
  onLayoutChange: (layout: MultiViewLayout) => void;
}

export function MultiViewGrid({
  streamers,
  statuses,
  layout,
  onLayoutChange,
}: MultiViewGridProps) {
  // Slots assign streamers to each box (default: first 4 streamers)
  const [slotStreamers, setSlotStreamers] = useState<string[]>([
    streamers[0]?.id || 'windah',
    streamers[1]?.id || 'miawaug',
    streamers[2]?.id || 'deankt',
    streamers[3]?.id || 'taraarts',
  ]);

  const handleSlotChange = (slotIndex: number, streamerId: string) => {
    const updated = [...slotStreamers];
    updated[slotIndex] = streamerId;
    setSlotStreamers(updated);
  };

  const getGridClass = () => {
    switch (layout) {
      case '1':
        return 'grid-cols-1';
      case '2':
        return 'grid-cols-1 md:grid-cols-2';
      case '3':
        return 'grid-cols-1 md:grid-cols-3';
      case '4':
        return 'grid-cols-1 md:grid-cols-2';
      default:
        return 'grid-cols-1';
    }
  };

  const activeSlotCount = parseInt(layout, 10);

  return (
    <div className="space-y-4">
      {/* Layout Mode Selector Bar */}
      <div className="flex items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <LayoutGrid className="w-4 h-4 text-red-500" />
          <span>Mode Multi-Stream:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLayoutChange('1')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layout === '1'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1 Stream</span>
          </button>

          <button
            onClick={() => onLayoutChange('2')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layout === '2'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2 Stream (Dual)</span>
          </button>

          <button
            onClick={() => onLayoutChange('3')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layout === '3'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>3 Stream</span>
          </button>

          <button
            onClick={() => onLayoutChange('4')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layout === '4'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>4 Stream (Quad)</span>
          </button>
        </div>
      </div>

      {/* Grid of Streams */}
      <div className={`grid ${getGridClass()} gap-4`}>
        {Array.from({ length: activeSlotCount }).map((_, slotIdx) => {
          const selectedStreamerId = slotStreamers[slotIdx] || streamers[0]?.id;
          const currentStreamer = streamers.find((s) => s.id === selectedStreamerId) || streamers[0];
          const currentStatus = currentStreamer ? statuses[currentStreamer.handle.toLowerCase()] : null;
          const isLive = currentStatus?.isLive;
          const videoId = currentStatus?.videoId;

          let embedUrl = '';
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`;
          } else if (currentStatus?.channelId) {
            embedUrl = `https://www.youtube.com/embed/live_stream?channel=${currentStatus.channelId}&autoplay=1`;
          }

          return (
            <div
              key={slotIdx}
              className="flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl"
            >
              {/* Slot Header with Streamer Selector Dropdown */}
              <div className="px-3 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-extrabold text-zinc-400">
                    {slotIdx + 1}
                  </span>

                  {/* Selector Dropdown */}
                  <select
                    value={selectedStreamerId}
                    onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 font-bold"
                  >
                    {streamers.map((s) => {
                      const sLive = statuses[s.handle.toLowerCase()]?.isLive;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} {sLive ? '🔴 (LIVE)' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {isLive && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-red-600 text-white uppercase">
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black">
                {isLive && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={currentStreamer.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-500 text-xs gap-1 bg-zinc-950">
                    <Radio className="w-6 h-6 text-zinc-600 mb-1" />
                    <span className="font-bold text-zinc-300">{currentStreamer.name}</span>
                    <span>Sedang Offline</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
