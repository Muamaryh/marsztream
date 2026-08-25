'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's a chunk loading mismatch after new deployment, auto reload once
    if (
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module')
    ) {
      window.location.reload();
    }
    console.error('Captured Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="neo-card max-w-md w-full p-6 text-center space-y-4 border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)]">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-red)] text-white border-[2.5px] border-[var(--border-color)] flex items-center justify-center mx-auto shadow-[2px_2px_0px_var(--shadow-color)]">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-black text-lg text-[var(--text-main)]">
            Terjadi Pembaruan Halaman
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-bold">
            Versi web terbaru baru saja diperbarui. Klik tombol di bawah untuk menyegarkan tampilan:
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="neo-btn neo-btn-primary flex-1 py-2.5 text-xs font-black shadow-[3px_3px_0px_var(--shadow-color)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/"
            className="neo-btn neo-btn-secondary py-2.5 px-4 text-xs font-black shadow-[3px_3px_0px_var(--shadow-color)]"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
