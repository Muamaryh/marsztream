'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useImeRP } from '@/context/ImeRPContext';
import { 
  Tv, 
  Radio, 
  Sun, 
  Moon, 
  RefreshCw, 
  Search,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { totalLive, refresh, isLoading, searchQuery, setSearchQuery } = useImeRP();

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-card)] border-b-[2.5px] border-[var(--border-color)] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--primary)] border-[2.5px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center -rotate-3 group-hover:rotate-3 group-hover:scale-105 transition-transform">
            <Tv className="w-5 h-5 text-[#18181b]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-[var(--text-main)] flex items-center gap-1">
              Marsz<span className="bg-[var(--accent-red)] text-white px-1.5 py-0.2 rounded-[6px] border-[2px] border-[var(--border-color)] text-sm shadow-[1.5px_1.5px_0px_var(--shadow-color)]">IMERP</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-extrabold tracking-wider uppercase -mt-0.5">
              GTA V Roleplay Hub
            </span>
          </div>
        </Link>

        {/* Live Stats Badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[var(--bg-canvas)] px-3.5 py-1.5 rounded-full border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]">
          <span className={`w-2 h-2 rounded-full ${totalLive > 0 ? 'bg-[var(--accent-red)] animate-ping' : 'bg-zinc-400'}`} />
          <span className="font-mono font-black text-xs text-[var(--text-main)]">
            {totalLive}
          </span>
          <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)]">
            IME RP Sedang Live
          </span>
        </div>

        {/* Search Bar on Desktop */}
        <div className="hidden md:flex items-center relative max-w-xs flex-1 mx-2">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari gang / streamer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-7 bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] rounded-full text-xs font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-[8px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] text-[var(--text-main)] hover:-translate-y-0.5 transition-transform active:translate-y-0.5 disabled:opacity-50"
            title="Perbarui Daftar Live"
            aria-label="Refresh Streams"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-[8px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] text-[var(--text-main)] hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
            title={theme === 'light' ? 'Ganti ke Tema Gelap' : 'Ganti ke Tema Terang'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#18181b]" />
            ) : (
              <Sun className="w-4 h-4 text-[#ffbe5b]" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
