import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t-[2.5px] border-[var(--border-color)] bg-[var(--bg-card)] py-4 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Google Sync Badge */}
        <div className="flex items-center gap-2 bg-[var(--bg-canvas)] px-3 py-1.5 rounded-[10px] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)]">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-mint)]" />
          <span className="text-[11px] font-black text-[var(--text-main)]">
            Otomatis sinkron dengan akun Google browser
          </span>
        </div>

        {/* Copyright */}
        <div className="text-center sm:text-right text-[11px] text-[var(--text-muted)] font-bold">
          <p>© {new Date().getFullYear()} MarszLive • Powered by YouTube Embed</p>
        </div>

      </div>
    </footer>
  );
}
