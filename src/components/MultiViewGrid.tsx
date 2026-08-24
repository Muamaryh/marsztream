'use client';

import React, { useState } from 'react';
import { Streamer, StreamerLiveStatus, MultiViewLayout } from '@/types/streamer';
import { LayoutGrid, Columns, Square, LayoutTemplate, Radio } from 'lucide-react';

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
      {/* Mode Selector Tabs (Neo-Brutalist 2D) */}
      <div className="neo-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-[var(--text-main)]">
          <LayoutGrid className="w-4 h-4 text-[var(--accent-red)]" />
          <span>Pilih Format Multi-Stream:</span>
        </div>

        {/* 2D Segmented Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onLayoutChange('1')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '1' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1 Stream</span>
          </button>

          <button
            onClick={() => onLayoutChange('2')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '2' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2 Stream (Dual)</span>
          </button>

          <button
            onClick={() => onLayoutChange('3')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '3' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>3 Stream</span>
          </button>

          <button
            onClick={() => onLayoutChange('4')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '4' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>4 Stream (Quad)</span>
          </button>
        </div>
      </div>

      {/* Grid of Stream Slots */}
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
              className="flex flex-col rounded-[16px] overflow-hidden bg-[var(--bg-card)] border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)]"
            >
              {/* Slot Header */}
              <div className="px-3.5 py-2.5 bg-[var(--bg-canvas)] border-b-[2px] border-[var(--border-color)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-[6px] bg-[var(--primary)] border-[1.5px] border-[var(--border-color)] flex items-center justify-center font-mono font-black text-xs text-[#18181b] shadow-[1px_1px_0px_var(--shadow-color)]">
                    {slotIdx + 1}
                  </span>

                  {/* Selector Dropdown */}
                  <select
                    value={selectedStreamerId}
                    onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
                    className="bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] text-[var(--text-main)] text-xs rounded-[8px] px-2.5 py-1 font-bold focus:outline-none shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer"
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
                    <span className="neo-badge bg-[var(--accent-red)] text-white text-[9px] px-2 py-0.5">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[var(--text-muted)] text-xs gap-1.5 bg-[var(--bg-card)]">
                    <Radio className="w-7 h-7 text-[var(--text-muted)] mb-1" />
                    <span className="font-black text-sm text-[var(--text-main)]">{currentStreamer.name}</span>
                    <span className="font-bold">Sedang Offline</span>
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
