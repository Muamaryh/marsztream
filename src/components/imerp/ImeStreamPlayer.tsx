'use client';

import React, { useState } from 'react';
import { ImeStream } from '@/types/imerp';
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
  Send,
  Users
} from 'lucide-react';

interface ImeStreamPlayerProps {
  stream: ImeStream | null;
}

export function ImeStreamPlayer({ stream }: ImeStreamPlayerProps) {
  const [showChat, setShowChat] = useState(true);

  if (!stream) {
    return (
      <div className="neo-card p-12 text-center text-[var(--text-muted)] space-y-3">
        <Radio className="w-10 h-10 mx-auto text-[var(--accent-red)] animate-pulse" />
        <h3 className="text-base font-black text-[var(--text-main)]">
          Belum Ada Stream Yang Dipilih
        </h3>
        <p className="text-xs font-bold">
          Pilih salah satu streamer IME Roleplay di bar atas untuk mulai menonton.
        </p>
      </div>
    );
  }

  const embedDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const videoEmbedUrl = `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`;
  const chatEmbedUrl = `https://www.youtube.com/live_chat?v=${stream.videoId}&embed_domain=${embedDomain}&dark_theme=1`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${stream.videoId}`;

  const openPopoutChat = () => {
    window.open(
      `https://www.youtube.com/live_chat?v=${stream.videoId}&is_popout=1`,
      'yt_chat_popout',
      'width=440,height=700,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  return (
    <div className="space-y-4">
      {/* Player and Chat Container */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        
        {/* Video Player Box */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-[16px] overflow-hidden bg-black border-[2.5px] border-[var(--border-color)] shadow-[4px_4px_0px_var(--shadow-color)]">
            <iframe
              src={videoEmbedUrl}
              title={stream.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Stream Metadata Card */}
          <div className="neo-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StreamerAvatar
                name={stream.channelName}
                avatarUrl={stream.avatar}
                size="lg"
                isLive={true}
              />

              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-base text-[var(--text-main)]">
                    {stream.channelName}
                  </h2>
                  <span className="neo-badge bg-[var(--accent-red)] text-white">
                    🔴 LIVE
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-bold line-clamp-1 mt-0.5">
                  {stream.title}
                </p>

                {/* Gang Tags */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {stream.gangs.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-black px-2 py-0.5 rounded-[6px] bg-[var(--primary)] text-[#18181b] border-[1.5px] border-[var(--border-color)] shadow-[1px_1px_0px_var(--shadow-color)]"
                    >
                      #{g}
                    </span>
                  ))}
                </div>
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

              <button
                onClick={openPopoutChat}
                className="neo-btn neo-btn-mint text-[10px] py-1 px-2.5 font-black shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                title="Buka jendela chat terpisah yang otomatis 100% login Google"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Popout Chat</span>
              </button>
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

            {/* Chat Iframe with #0f0f0f background */}
            <div className="flex-1 w-full bg-[#0f0f0f] flex flex-col min-h-0">
              <iframe
                src={chatEmbedUrl}
                title={`Live Chat ${stream.channelName}`}
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
          </div>
        )}

      </div>
    </div>
  );
}
