'use client';

import React, { useState } from 'react';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { useTheme } from '@/context/ThemeContext';
import { StreamerAvatar } from '@/components/StreamerAvatar';
import { 
  MessageSquare, 
  ExternalLink, 
  Radio, 
  AlertCircle, 
  Maximize2,
  Tv,
  CheckCircle2,
  Sparkles,
  Info,
  Send
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
  const { theme } = useTheme();
  const [showChat, setShowChat] = useState(true);

  const isLive = status?.isLive;
  const videoId = status?.videoId;
  // Prioritize genuine channel avatar
  const avatarUrl = streamer.avatar || (status?.avatar?.includes('yt3.') ? status.avatar : null);
  const streamTitle = status?.title || `${streamer.name} Livestream`;

  const embedDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Video embed URL
  let videoEmbedUrl = '';
  if (videoId) {
    videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`;
  } else if (status?.channelId) {
    videoEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=${status.channelId}&autoplay=1`;
  }

  // Always use dark_theme=1 for YouTube Live Chat embed to avoid white-on-white invisible text bug
  const chatEmbedUrl = videoId
    ? `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}&dark_theme=1`
    : '';

  const youtubeWatchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/${streamer.handle}/live`;

  const openPopoutChat = () => {
    if (videoId) {
      window.open(
        `https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`,
        'yt_chat_popout',
        'width=440,height=700,menubar=no,toolbar=no,location=no,status=no'
      );
    } else {
      window.open(
        `https://www.youtube.com/${streamer.handle}/live`,
        '_blank'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Player and Chat Container */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        
        {/* Video Player Box */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-[16px] overflow-hidden bg-black border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)]">
            {isLive && videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={streamTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              /* Offline Neo-Brutalist Screen */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-card)] text-[var(--text-main)] gap-4">
                <StreamerAvatar
                  name={streamer.name}
                  avatarUrl={avatarUrl}
                  size="lg"
                  className="w-16 h-16 text-base"
                />

                <div className="space-y-1">
                  <div className="neo-badge bg-[var(--bg-canvas)] mx-auto mb-1">
                    🔴 Status: Offline
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
                    {streamer.name} Sedang Tidak Live
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-semibold max-w-sm">
                    Streamer ini belum memulai siaran langsung saat ini.
                  </p>
                </div>

                {/* Suggestions for other live streamers */}
                {liveStreamers.length > 0 && onSwitchStreamer && (
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                      Streamer lain yang sedang LIVE:
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {liveStreamers.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onSwitchStreamer(s.id)}
                          className="neo-btn neo-btn-primary text-xs py-1.5 px-3"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
                          <span>Tonton {s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neo-btn neo-btn-secondary text-xs py-2 px-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Channel di YouTube</span>
                </a>
              </div>
            )}
          </div>

          {/* Stream Metadata Card (Neo-Brutalist) */}
          <div className="neo-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StreamerAvatar
                name={streamer.name}
                avatarUrl={avatarUrl}
                size="lg"
                isLive={isLive}
              />

              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-base text-[var(--text-main)]">
                    {streamer.name}
                  </h2>
                  <span className="font-mono text-xs text-[var(--text-muted)] font-bold">
                    {streamer.handle}
                  </span>
                  {isLive && (
                    <span className="neo-badge bg-[var(--accent-red)] text-white">
                      🔴 LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] font-bold line-clamp-1 mt-0.5">
                  {streamTitle}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              {/* Toggle Embedded Chat */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`neo-btn text-xs py-2 px-3 ${
                  showChat ? 'neo-btn-primary' : 'neo-btn-secondary'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showChat ? 'Tutup Chat' : 'Buka Chat'}</span>
              </button>

              {/* Open in YouTube */}
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-secondary text-xs py-2 px-3"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Chat Panel */}
        {showChat && (
          <div className="w-full xl:w-[390px] 2xl:w-[430px] shrink-0 h-[600px] xl:h-[620px] rounded-[16px] overflow-hidden bg-[var(--bg-card)] border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col">
            
            {/* Chat Header */}
            <div className="p-3 border-b-[2px] border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-canvas)] gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[var(--text-main)]">
                <MessageSquare className="w-4 h-4 text-[var(--accent-red)]" />
                <span>Live Chat YouTube</span>
              </div>

              <div className="flex items-center gap-1">
                {isLive && videoId && (
                  <button
                    onClick={openPopoutChat}
                    className="neo-btn neo-btn-mint text-[10px] py-1 px-2.5 font-black shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                    title="Buka jendela chat terpisah yang otomatis 100% login Google"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Popout Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Auto-Login Notice Banner */}
            <div className="px-3 py-2 bg-[var(--accent-yellow)] text-[#18181b] border-b-[2px] border-[var(--border-color)] flex items-center justify-between text-[11px] font-black">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#18181b] shrink-0" />
                <span className="truncate">Mau kirim chat tanpa login ulang?</span>
              </div>
              <button
                onClick={openPopoutChat}
                className="underline font-black hover:text-[var(--accent-red)] transition-colors shrink-0 ml-1"
              >
                Klik Popout ⚡
              </button>
            </div>

            {/* Chat Iframe with dedicated #0f0f0f dark background */}
            {isLive && chatEmbedUrl ? (
              <div className="flex-1 w-full bg-[#0f0f0f] flex flex-col min-h-0">
                <iframe
                  src={chatEmbedUrl}
                  title={`Live Chat ${streamer.name}`}
                  className="w-full flex-1 border-0 min-w-[340px] bg-[#0f0f0f]"
                />
                {/* Bottom Quick Action */}
                <div className="p-2.5 border-t-[2px] border-[var(--border-color)] bg-[var(--bg-card)]">
                  <button
                    onClick={openPopoutChat}
                    className="neo-btn neo-btn-primary w-full text-xs py-2 font-black shadow-[2px_2px_0px_var(--shadow-color)]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Chat (Buka Popout Auto-Login)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] text-xs gap-2 bg-[var(--bg-card)]">
                <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
                <p className="font-bold">Live chat tidak tersedia karena streamer sedang offline atau chat dinonaktifkan.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
