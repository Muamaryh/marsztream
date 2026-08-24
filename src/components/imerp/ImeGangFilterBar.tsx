'use client';

import React, { useState } from 'react';
import { useImeRP } from '@/context/ImeRPContext';
import { Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export function ImeGangFilterBar() {
  const { gangs, selectedGang, setSelectedGang } = useImeRP();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!gangs.length) return null;

  // Default show top 18 gangs, click expand to show all
  const INITIAL_LIMIT = 18;
  const displayedGangs = isExpanded ? gangs : gangs.slice(0, INITIAL_LIMIT);
  const hasMore = gangs.length > INITIAL_LIMIT;

  return (
    <div className="w-full neo-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="neo-badge bg-[var(--accent-yellow)]">
            <Users className="w-3.5 h-3.5 text-[#18181b]" />
            <span className="font-bold text-[#18181b]">Filter Gang & Fraksi</span>
          </span>
          <span className="text-xs text-[var(--text-muted)] font-bold hidden sm:inline">
            Klik salah satu gang untuk menyaring streamer:
          </span>
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="neo-btn neo-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 font-black"
          >
            <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${gangs.length})`}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Multi-line Wrap Pill Grid (Nyusun ke Bawah, Tanpa Perlu Digeser) */}
      <div className="flex flex-wrap gap-2 pt-1">
        {displayedGangs.map((gang) => {
          const isActive = selectedGang === gang.id;

          return (
            <button
              key={gang.id}
              onClick={() => setSelectedGang(gang.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[2px] border-[var(--border-color)] text-xs font-black transition-all select-none ${
                isActive
                  ? 'bg-[var(--primary)] text-[#18181b] shadow-[3px_3px_0px_var(--shadow-color)] -translate-y-0.5'
                  : 'bg-[var(--bg-canvas)] text-[var(--text-main)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_var(--shadow-color)]'
              }`}
            >
              {gang.icon && <span>{gang.icon}</span>}
              <span>{gang.name}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-[#18181b] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {gang.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
