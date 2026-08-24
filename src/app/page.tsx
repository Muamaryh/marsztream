'use client';

import React from 'react';
import { useImeRP } from '@/context/ImeRPContext';
import { ImeGangFilterBar } from '@/components/imerp/ImeGangFilterBar';
import { ImeStreamerBar } from '@/components/imerp/ImeStreamerBar';
import { ImeStreamPlayer } from '@/components/imerp/ImeStreamPlayer';
import { ImeMultiViewGrid } from '@/components/imerp/ImeMultiViewGrid';
import { 
  Radio, 
  LayoutGrid, 
  Square, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const {
    streams,
    activeStream,
    totalLive,
    layout,
    setLayout,
    isLoading,
  } = useImeRP();

  if (isLoading && !streams.length) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
        <Loader2 className="w-9 h-9 text-[var(--accent-red)] animate-spin" />
        <p className="text-sm font-black">Mencari Streamer IME Roleplay yang Sedang Live...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Hero / Header Section (Neo-Brutalist 2D) */}
      <div className="neo-card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="neo-badge bg-[var(--accent-red)] text-white">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {totalLive} STREAMER IME RP LIVE
            </span>
            <span className="neo-badge bg-[var(--accent-mint)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#18181b]" />
              Auto Filter #IMERP & Gangs
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">
            IME Roleplay <span className="bg-[var(--primary)] text-[#18181b] px-2 py-0.5 rounded-[6px] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] inline-block -rotate-1">Live Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-bold">
            Pantau pergerakan gang Vagabond, KZN, 4Blood, Olsen, Police/PD, dan lainnya secara real-time di satu layar.
          </p>
        </div>

        {/* View Mode Toggle (Single vs Multi-View) */}
        <div className="flex items-center gap-2 bg-[var(--bg-canvas)] p-1.5 rounded-[12px] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] shrink-0 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setLayout('1')}
            className={`neo-btn text-xs py-1.5 px-3.5 ${
              layout === '1' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>Single View</span>
          </button>

          <button
            onClick={() => setLayout('2')}
            className={`neo-btn text-xs py-1.5 px-3.5 ${
              layout !== '1' ? 'neo-btn-primary' : 'neo-btn-secondary'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Multi-View (Mabar/War)</span>
          </button>
        </div>
      </div>

      {/* Gang & Faction Filter Bar */}
      <ImeGangFilterBar />

      {/* Streamer List Carousel */}
      <ImeStreamerBar />

      {/* Main Viewport */}
      {layout === '1' ? (
        <ImeStreamPlayer stream={activeStream} />
      ) : (
        <ImeMultiViewGrid />
      )}

    </div>
  );
}
