'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { useImeRP } from '@/context/ImeRPContext';
import { ImeStream } from '@/types/imerp';
import { LayoutGrid, Columns, Square, LayoutTemplate, Radio } from 'lucide-react';

interface MultiViewSlotProps {
  slotIdx: number;
  selectedStreamId: string;
  currentStream?: ImeStream;
  streamPool: ImeStream[];
  otherStreams: ImeStream[];
  gangDisplayName: string;
  onSlotChange: (slotIdx: number, streamId: string) => void;
}

const MultiViewSlot = memo(function MultiViewSlot({
  slotIdx,
  selectedStreamId,
  currentStream,
  streamPool,
  otherStreams,
  gangDisplayName,
  onSlotChange,
}: MultiViewSlotProps) {
  const embedUrl = currentStream
    ? `https://www.youtube.com/embed/${currentStream.videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`
    : '';

  return (
    <div className="flex flex-col rounded-[16px] overflow-hidden bg-[var(--bg-card)] border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)]">
      {/* Slot Header with Streamer Dropdown */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-canvas)] border-b-[2px] border-[var(--border-color)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-6 h-6 shrink-0 rounded-[6px] bg-[var(--primary)] border-[1.5px] border-[var(--border-color)] flex items-center justify-center font-mono font-black text-xs text-[#18181b] shadow-[1px_1px_0px_var(--shadow-color)]">
            {slotIdx + 1}
          </span>

          {/* Selector Dropdown */}
          <select
            value={selectedStreamId}
            onChange={(e) => onSlotChange(slotIdx, e.target.value)}
            className="bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] text-[var(--text-main)] text-xs rounded-[8px] px-2.5 py-1 font-bold focus:outline-none shadow-[1.5px_1.5px_0px_var(--shadow-color)] cursor-pointer flex-1 truncate"
          >
            {/* Primary group: Streamers in active gang filter */}
            <optgroup label={`Anggota ${gangDisplayName} (${streamPool.length} Live)`}>
              {streamPool.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.channelName} [{Array.isArray(s.gangs) ? s.gangs.join(', ') : ''}]
                </option>
              ))}
            </optgroup>

            {/* Secondary group: Other streamers for cross-faction war watching */}
            {otherStreams.length > 0 && (
              <optgroup label="Streamer Gang / Kubu Lain">
                {otherStreams.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.channelName} [{Array.isArray(s.gangs) ? s.gangs.join(', ') : ''}]
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {currentStream && (
            <span className="neo-badge bg-[var(--accent-red)] text-white text-[9px] px-2 py-0.5 shrink-0">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video w-full bg-black">
        {currentStream && embedUrl ? (
          <iframe
            key={currentStream.videoId}
            src={embedUrl}
            title={currentStream.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[var(--text-muted)] text-xs gap-1.5 bg-[var(--bg-card)]">
            <Radio className="w-7 h-7 text-[var(--text-muted)] mb-1" />
            <span className="font-black text-sm text-[var(--text-main)]">Pilih Streamer</span>
          </div>
        )}
      </div>
    </div>
  );
});

export function ImeMultiViewGrid() {
  const { streams, filteredStreams, selectedGang, gangs, layout, setLayout } = useImeRP();

  // Active gang metadata
  const currentGangObj = gangs.find((g) => g.id === selectedGang);
  const gangDisplayName = currentGangObj ? currentGangObj.name : 'Semua Stream';
  const gangIcon = currentGangObj?.icon || '🔥';

  // Active pool of streams based on filter
  const streamPool = filteredStreams.length > 0 ? filteredStreams : streams;

  const [slotStreamIds, setSlotStreamIds] = useState<string[]>([
    streamPool[0]?.id || '',
    streamPool[1]?.id || streamPool[0]?.id || '',
    streamPool[2]?.id || streamPool[0]?.id || '',
    streamPool[3]?.id || streamPool[0]?.id || '',
  ]);

  const prevGangRef = useRef<string>(selectedGang);

  // ONLY auto-fill when user MANUALLY changes gang filter, NEVER on background SWR polling!
  useEffect(() => {
    if (prevGangRef.current !== selectedGang) {
      prevGangRef.current = selectedGang;
      if (streamPool.length > 0) {
        setSlotStreamIds([
          streamPool[0]?.id || '',
          streamPool[1]?.id || streamPool[0]?.id || '',
          streamPool[2]?.id || streamPool[0]?.id || '',
          streamPool[3]?.id || streamPool[0]?.id || '',
        ]);
      }
    }
  }, [selectedGang, streamPool]);

  const handleSlotChange = (slotIndex: number, streamId: string) => {
    setSlotStreamIds((prev) => {
      const updated = [...prev];
      updated[slotIndex] = streamId;
      return updated;
    });
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
  const otherStreams = streams.filter((s) => !streamPool.some((p) => p.id === s.id));

  return (
    <div className="space-y-4">
      {/* Multi-View Header & Layout Selector */}
      <div className="neo-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black text-[var(--text-main)]">
            <LayoutGrid className="w-4 h-4 text-[var(--accent-red)]" />
            <span>Format Multi-Stream:</span>
          </div>

          <span className="neo-badge bg-[var(--primary)] text-[#18181b] text-[11px] font-black">
            {gangIcon} {gangDisplayName} ({streamPool.length} Live)
          </span>
        </div>

        {/* 2D Segmented Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLayout('1')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '1' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1 Stream</span>
          </button>

          <button
            onClick={() => setLayout('2')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '2' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2 Stream (Dual)</span>
          </button>

          <button
            onClick={() => setLayout('3')}
            className={`neo-btn text-xs py-1.5 px-3 ${
              layout === '3' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>3 Stream</span>
          </button>

          <button
            onClick={() => setLayout('4')}
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
          const selectedStreamId =
            slotStreamIds[slotIdx] ||
            streamPool[slotIdx]?.id ||
            streamPool[0]?.id ||
            streams[0]?.id;

          const currentStream =
            streams.find((s) => s.id === selectedStreamId) ||
            streamPool[0] ||
            streams[0];

          return (
            <MultiViewSlot
              key={slotIdx}
              slotIdx={slotIdx}
              selectedStreamId={selectedStreamId}
              currentStream={currentStream}
              streamPool={streamPool}
              otherStreams={otherStreams}
              gangDisplayName={gangDisplayName}
              onSlotChange={handleSlotChange}
            />
          );
        })}
      </div>
    </div>
  );
}
