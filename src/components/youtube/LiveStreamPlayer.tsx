'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { 
  MessageSquare, 
  ExternalLink, 
  Radio, 
  Tv, 
  AlertCircle, 
  Volume2, 
  Maximize2 
} from 'lucide-react';

interface LiveStreamPlayerProps {
  streamer: Streamer;
  status?: StreamerLiveStatus | null;
  liveStreamers?: Streamer[];
  onSwitchStreamer?: (id: string) => void;
}

export function LiveStreamPlayer({
  streamer,
  status,
  liveStreamers = [],
  onSwitchStreamer,
}: LiveStreamPlayerProps) {
  const [showChat, setShowChat] = useState(true);

  const isLive = status?.isLive;
  const videoId = status?.videoId;
  const avatarUrl = status?.avatar || streamer.avatar;
  const streamTitle = status?.title || `${streamer.name} Livestream`;

  // Get current hostname for live chat embed domain
  const embedDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Embed URL for YouTube Video
  // If we have videoId, embed that directly. Otherwise, fallback to channel live embed or handle
  let videoEmbedUrl = '';
  if (videoId) {
    videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`;
  } else if (status?.channelId) {
    videoEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${status.channelId}&autoplay=1`;
  }

  // Embed URL for Live Chat
  const chatEmbedUrl = videoId
    ? `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}`
    : '';

  const youtubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/${streamer.handle}/live`;

  return (
    <div className="space-y-4">
      {/* Player and Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        
        {/* Video Player (3 Cols if Chat open, 4 Cols if Chat closed) */}
        <div className={`${showChat ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-3 transition-all`}>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
            {isLive && videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={streamTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              /* Offline Banner & Suggestions */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 text-zinc-300 gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={streamer.name}
                      fill
                      className="object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg text-zinc-500">
                      {streamer.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {streamer.name} sedang Offline
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Streamer ini belum memulai siaran langsung saat ini.
                  </p>
                </div>

                {/* Quick suggestions if other streamers are live */}
                {liveStreamers.length > 0 && onSwitchStreamer && (
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                      Streamer lain yang sedang LIVE:
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {liveStreamers.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onSwitchStreamer(s.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all"
                        >
                          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                          <span>Tonton {s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Channel YouTube</span>
                </a>
              </div>
            )}
          </div>

          {/* Stream Metadata Bar */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={streamer.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm text-zinc-400">
                    {streamer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isLive && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-zinc-900" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm sm:text-base text-white">
                    {streamer.name}
                  </h2>
                  <span className="text-xs text-zinc-500 font-mono">
                    {streamer.handle}
                  </span>
                  {isLive && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white uppercase">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-medium line-clamp-1 mt-0.5">
                  {streamTitle}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  showChat
                    ? 'bg-zinc-800 text-white border-zinc-700'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showChat ? 'Sembunyikan Chat' : 'Buka Live Chat'}</span>
              </button>

              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Chat Panel (1 Col) */}
        {showChat && (
          <div className="lg:col-span-1 h-[520px] rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800 flex flex-col shadow-xl">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                <span>Live Chat YouTube</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">
                {streamer.name}
              </span>
            </div>

            {isLive && chatEmbedUrl ? (
              <iframe
                src={chatEmbedUrl}
                title={`Live Chat ${streamer.name}`}
                className="w-full flex-1 border-0 bg-transparent"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 text-xs gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-600" />
                <p>Live chat tidak tersedia karena streamer sedang offline atau chat dinonaktifkan.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
