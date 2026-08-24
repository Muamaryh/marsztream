'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, History, X, Trash2 } from 'lucide-react';
import { useLocalLibrary } from '@/hooks/useLocalLibrary';

export function ContinueWatchingSection() {
  const { history, removeHistoryItem, clearHistory, isLoaded } = useLocalLibrary();

  if (!isLoaded || history.length === 0) return null;

  return (
    <section className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-red-500" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Lanjutkan Menonton
          </h2>
        </div>

        <button
          onClick={clearHistory}
          className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Bersihkan</span>
        </button>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {history.slice(0, 10).map((item) => {
          const progressPercent = item.durationSeconds > 0
            ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
            : 0;

          return (
            <div
              key={`${item.provider}-${item.id}`}
              className="group relative shrink-0 w-56 sm:w-64 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
            >
              <Link
                href={`/watch/${item.provider}/${item.id}?ep=${item.lastEpisodeNumber}`}
                className="block relative aspect-video w-full bg-zinc-800"
              >
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Progress Bar at Bottom of Image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeHistoryItem(item.id, item.provider)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                title="Hapus dari riwayat"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Info */}
              <div className="p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-red-400 uppercase">
                  {item.provider} • Ep {item.lastEpisodeNumber}
                </span>
                <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {item.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
