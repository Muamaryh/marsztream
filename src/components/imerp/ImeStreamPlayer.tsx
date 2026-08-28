'use client';

import React, { useState } from 'react';
import { ImeStream } from '@/types/imerp';
import { StreamerAvatar } from '@/components/StreamerAvatar';
import { 
  MessageSquare, 
  ExternalLink, 
  Radio, 
  Maximize2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  X,
  Smartphone,
  ShieldCheck,
  Bell
} from 'lucide-react';

interface ImeStreamPlayerProps {
  stream: ImeStream | null;
}

export function ImeStreamPlayer({ stream }: ImeStreamPlayerProps) {
  const [showChat, setShowChat] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);

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
  const channelHandleClean = stream.channelHandle
    ? stream.channelHandle.startsWith('@')
      ? stream.channelHandle
      : `@${stream.channelHandle.replace(/\s+/g, '')}`
    : `@${(stream.channelName || 'Streamer').replace(/\s+/g, '')}`;
  const subscribeUrl = `https://www.youtube.com/${channelHandleClean}?sub_confirmation=1`;
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Stream Information Card */}
          <div className="neo-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <StreamerAvatar
                name={stream.channelName}
                avatarUrl={stream.avatar}
                size="lg"
                isLive={true}
              />

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-base text-[var(--text-main)] truncate">
                    {stream.channelName}
                  </h2>
                  <span className="neo-badge bg-[var(--accent-red)] text-white text-[10px] py-0.5">
                    🔴 SEDANG LIVE
                  </span>
                  {stream.viewers && (
                    <span className="neo-badge bg-[var(--accent-mint)] text-[10px] py-0.5">
                      👁️ {stream.viewers}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--text-muted)] font-bold line-clamp-1 mt-0.5" title={stream.title}>
                  {stream.title}
                </p>

                {/* Gang Tags */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {(Array.isArray(stream.gangs) ? stream.gangs : []).map((g) => (
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
              {/* Subscribe Button */}
              <a
                href={subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-red text-xs py-2 px-3 shadow-[2px_2px_0px_var(--shadow-color)]"
                title={`Subscribe ke channel YouTube ${stream.channelName}`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </a>

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

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="neo-btn neo-btn-secondary text-[10px] py-1 px-2 font-black shadow-[1.5px_1.5px_0px_var(--shadow-color)]"
                  title="Panduan agar bisa chat langsung di HP / Safari / Brave"
                >
                  <HelpCircle className="w-3 h-3 text-[var(--primary)]" />
                  <span>Tips Login</span>
                </button>

                <button
                  onClick={openPopoutChat}
                  className="neo-btn neo-btn-mint text-[10px] py-1 px-2 font-black shadow-[1.5px_1.5px_0px_var(--shadow-color)] hidden sm:inline-flex"
                  title="Buka jendela chat terpisah yang otomatis 100% login Google (PC)"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Popout</span>
                </button>
              </div>
            </div>

            {/* Quick Auto-Login Notice Banner */}
            <div className="px-3 py-2 bg-[var(--accent-yellow)] text-[#18181b] border-b-[2px] border-[var(--border-color)] flex items-center justify-between text-[11px] font-black">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#18181b] shrink-0" />
                <span className="truncate">Muncul tulisan &quot;Sign in to chat&quot;?</span>
              </div>
              <button
                onClick={() => setShowGuideModal(true)}
                className="underline hover:opacity-80 shrink-0 font-extrabold ml-2"
              >
                Lihat Cara Aktifkan ✨
              </button>
            </div>

            {/* YouTube Live Chat Embedded Iframe */}
            <div className="flex-1 w-full bg-black relative">
              <iframe
                src={chatEmbedUrl}
                title="Live Chat"
                className="w-full h-full border-0"
                allow="clipboard-write"
              />
            </div>
          </div>
        )}
      </div>

      {/* Guide Modal: Third-Party Cookies for Mobile & Non-Chrome */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="neo-card max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[var(--accent-red)]" />
                <h3 className="font-black text-base text-[var(--text-main)]">
                  Cara Chat Langsung Tanpa Disuruh Login
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-[8px] hover:bg-[var(--bg-canvas)] border-[1.5px] border-transparent hover:border-[var(--border-color)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3.5 text-xs text-[var(--text-muted)] font-bold">
              <div className="p-3 rounded-[10px] bg-[var(--accent-yellow)] text-[#18181b] border-[2px] border-[var(--border-color)] space-y-1">
                <p className="font-extrabold text-[13px]">
                  💡 Kenapa di HP / Safari / Brave disuruh Login lagi?
                </p>
                <p className="text-[11px] leading-relaxed">
                  Browser HP dan non-Chrome secara bawaan memblokir <em>&quot;Third-Party Cookies&quot;</em> untuk iframe YouTube. Cukup izinkan 1x agar akun Google kamu langsung tersambung otomatis!
                </p>
              </div>

              {/* Zero Data Privacy Guarantee */}
              <div className="p-3 rounded-[10px] bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#065f46] dark:text-[#6ee7b7] border-[2px] border-[#059669] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" />
                <div className="text-[11px] font-bold leading-relaxed">
                  <span className="font-black">Privasi 100% Aman & Terjamin:</span> MarszLive sama sekali <strong>TIDAK mengambil, menyimpan, merekam, atau melihat data akun Google kamu</strong>. Login sepenuhnya terjadi di server resmi Google/YouTube.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-[var(--text-main)] text-sm">
                  Pilih Langkah Sesuai Browser Kamu:
                </h4>

                {/* Android Chrome */}
                <div className="p-3 rounded-[10px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] space-y-1">
                  <div className="flex items-center gap-2 text-[var(--text-main)] font-black">
                    <span>📱</span>
                    <span>Google Chrome di HP Android:</span>
                  </div>
                  <ol className="list-decimal list-inside text-[11px] space-y-0.5 pl-1">
                    <li>Buka menu titik tiga (⋮) di pojok kanan atas Chrome HP.</li>
                    <li>Pilih <strong>Setelan (Settings)</strong> ➡️ <strong>Setelan Situs (Site Settings)</strong>.</li>
                    <li>Pilih <strong>Cookie pihak ketiga (Third-party cookies)</strong>.</li>
                    <li>Pilih <strong>&quot;Izinkan cookie pihak ketiga&quot;</strong>.</li>
                  </ol>
                </div>

                {/* iPhone Safari */}
                <div className="p-3 rounded-[10px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] space-y-1">
                  <div className="flex items-center gap-2 text-[var(--text-main)] font-black">
                    <span>🍎</span>
                    <span>iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside text-[11px] space-y-0.5 pl-1">
                    <li>Buka <strong>Pengaturan (Settings) iOS</strong> HP kamu.</li>
                    <li>Scroll ke bawah dan pilih <strong>Safari</strong>.</li>
                    <li>Matikan opsi <strong>&quot;Prevent Cross-Site Tracking&quot;</strong> dan <strong>&quot;Block All Cookies&quot;</strong>.</li>
                  </ol>
                </div>

                {/* Brave Browser */}
                <div className="p-3 rounded-[10px] bg-[var(--bg-canvas)] border-[2px] border-[var(--border-color)] space-y-1">
                  <div className="flex items-center gap-2 text-[var(--text-main)] font-black">
                    <span>🦁</span>
                    <span>Brave Browser:</span>
                  </div>
                  <p className="text-[11px] pl-1">
                    Klik ikon <strong>Brave Shield (Singa)</strong> di sebelah kolom alamat URL, lalu ubah <em>&quot;Cross-site trackers blocked&quot;</em> menjadi <strong>Disabled</strong> untuk website ini.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t-[2px] border-[var(--border-color)] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="neo-btn neo-btn-primary py-2 px-4 text-xs font-black"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Saya Mengerti</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
