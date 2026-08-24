'use client';

import React, { useState } from 'react';
import { useImeRP } from '@/context/ImeRPContext';
import { StreamerAvatar } from '@/components/StreamerAvatar';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { Radio, Plus } from 'lucide-react';

export function ImeStreamerBar() {
  const { filteredStreams, activeStreamId, selectStream, selectedGang, gangs } = useImeRP();
  const [displayCount, setDisplayCount] = useState<number>(36);

  const currentGangObj = gangs.find((g) => g.id === selectedGang);

  if (!filteredStreams.length) {
    return (
      <div className="neo-card p-6 text-center text-[var(--text-muted)] space-y-2">
        <Radio className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
        <p className="font-bold text-sm">
          Tidak ada streamer yang sedang live dengan filter gang &quot;{currentGangObj?.name || selectedGang}&quot; saat ini.
        </p>
      </div>
    );
  }

  const visibleStreams = filteredStreams.slice(0, displayCount);
  const hasMore = filteredStreams.length > displayCount;

  return (
    <div className="w-full space-y-2">
      {/* Streamers Horizontal Carousel with Drag & Arrows */}
      <ScrollableRow className="py-2 px-1 gap-3">
        {visibleStreams.map((stream) => {
          const isActive = stream.id === activeStreamId;

          return (
            <button
              key={stream.id}
              onClick={() => selectStream(stream.id)}
              className={`group relative shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] border-[2.5px] border-[var(--border-color)] transition-all duration-150 text-left select-none ${
                isActive
                  ? 'bg-[var(--primary)] text-[#18181b] shadow-[4px_4px_0px_var(--shadow-color)] -translate-y-1'
                  : 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-[2px_2px_0px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]'
              }`}
            >
              {/* Avatar */}
              <StreamerAvatar
                name={stream.channelName}
                avatarUrl={stream.avatar}
                size="md"
                isLive={true}
              />

              {/* Streamer & Title Info */}
              <div className="flex flex-col min-w-[120px] max-w-[190px]">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className={`font-black text-xs truncate ${isActive ? 'text-[#18181b]' : 'text-[var(--text-main)]'}`}>
                    {stream.channelName}
                  </span>
                  <span className="neo-badge bg-[var(--accent-red)] text-white text-[9px] px-1.5 py-0">
                    LIVE
                  </span>
                </div>

                <p className={`text-[10px] font-bold line-clamp-1 mt-0.5 ${isActive ? 'text-[#3f3f46]' : 'text-[var(--text-muted)]'}`}>
                  {stream.title}
                </p>

                {/* Gang Tags */}
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {stream.gangs.slice(0, 2).map((g) => (
                    <span
                      key={g}
                      className={`text-[8px] font-black px-1 py-0.2 rounded-[4px] border border-[var(--border-color)] ${
                        isActive ? 'bg-[#18181b] text-white' : 'bg-[var(--bg-canvas)] text-[var(--text-main)]'
                      }`}
                    >
                      {g}
                    </span>
                  ))}
                  {stream.gangs.length > 2 && (
                    <span className="text-[8px] font-extrabold text-[var(--text-muted)]">
                      +{stream.gangs.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => setDisplayCount((prev) => prev + 36)}
            className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-[14px] bg-[var(--bg-card)] border-[2.5px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] text-xs font-black text-[var(--text-main)] hover:bg-[var(--primary)] hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Muat +{filteredStreams.length - displayCount} Streamer Lainnya</span>
          </button>
        )}
      </ScrollableRow>
    </div>
  );
}
