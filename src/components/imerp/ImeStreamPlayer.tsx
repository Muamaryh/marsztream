'use client';

import React, { useState } from 'react';
import { ImeStream } from '@/types/imerp';
import { StreamerAvatar } from '@/components/StreamerAvatar';
import { 
  MessageSquare, 
  ExternalLink, 
  Radio, 
  Maximize2,
  Tv,
  CheckCircle2,
  Sparkles,
  Send,
  HelpCircle,
  X,
  Smartphone,
  ShieldCheck,
  Globe,
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                className="underline font-black hover:text-[var(--accent-red)] transition-colors shrink-0 ml-1"
              >
                Lihat Cara Aktifkan 💡
              </button>
            </div>

            {/* Chat Iframe with #0f0f0f background */}
            <div className="flex-1 w-full bg-[#0f0f0f] flex flex-col min-h-0">
              <iframe
                src={chatEmbedUrl}
                title={`Live Chat ${stream.channelName}`}
                className="w-full h-full border-0 min-w-0 bg-[#0f0f0f]"
              />
            </div>
          </div>
        )}

      </div>

      {/* Interactive Modal: How to Enable Direct Chat on Mobile / Safari / Brave */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neo-card bg-[var(--bg-card)] w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-[2px] border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] border-[1.5px] border-[var(--border-color)] flex items-center justify-center shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
                  <ShieldCheck className="w-5 h-5 text-[#18181b]" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[var(--text-main)]">
                    Cara Kirim Chat Langsung di Web
                  </h3>
                  <p className="text-[11px] font-bold text-[var(--text-muted)]">
                    Tanpa perlu buka tab baru di HP & Browser lain
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-7 h-7 rounded-[6px] bg-[var(--bg-canvas)] border-[1.5px] border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--accent-red)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation */}
            <div className="p-3 bg-[var(--bg-canvas)] rounded-[12px] border-[2px] border-[var(--border-color)] text-xs text-[var(--text-main)] space-y-1.5">
              <p className="font-black text-[var(--accent-red)]">
                🔒 Kenapa Browser (Selain Chrome) meminta Login?
              </p>
              <p className="font-semibold text-[var(--text-muted)] leading-relaxed">
                Browser seperti <strong>Safari (iPhone), Brave, Firefox, dan Browser HP</strong> secara bawaan memblokir <em>&quot;Cookie Pihak Ketiga (Cross-Site Tracking)&quot;</em> untuk privasi. Akibatnya, kotak chat di web tidak bisa otomatis membaca akun Google kamu.
              </p>
            </div>

            {/* Step by Step per Browser */}
            <div className="space-y-2.5 text-xs text-[var(--text-main)] font-semibold">
              <p className="font-black text-sm text-[var(--text-main)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                Pilih browser yang kamu gunakan:
              </p>

              {/* Option 1: iPhone / Safari */}
              <div className="p-3 rounded-[10px] bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1">
                <span className="font-black text-[var(--accent-red)] flex items-center gap-1">
                  🍎 Pengguna iPhone / Safari:
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Buka <strong>Pengaturan iPhone (Settings)</strong> ➡️ pilih <strong>Safari</strong> ➡️ matikan (OFF) pilihan <strong>&quot;Prevent Cross-Site Tracking&quot;</strong> (Cegah Pelacakan Lintas Situs) ➡️ lalu refresh web ini. Kotak chat akan langsung login otomatis!
                </p>
              </div>

              {/* Option 2: Brave Browser */}
              <div className="p-3 rounded-[10px] bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1">
                <span className="font-black text-[var(--accent-mint)] flex items-center gap-1">
                  🦁 Pengguna Brave Browser:
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Klik ikon singa <strong>Brave Shields</strong> di sebelah address bar ➡️ Matikan Shields atau ubah <em>&quot;Block Cross-site Cookies&quot;</em> menjadi <strong>&quot;Allow Cookies&quot;</strong>.
                </p>
              </div>

              {/* Option 3: Chrome / Samsung Internet di HP */}
              <div className="p-3 rounded-[10px] bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1">
                <span className="font-black text-[var(--accent-blue)] flex items-center gap-1">
                  📱 Chrome / Samsung Internet di HP:
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Buka Setelan Browser ➡️ <strong>Setelan Situs / Privasi</strong> ➡️ <strong>Cookie Pihak Ketiga</strong> ➡️ pilih <strong>Izinkan Cookie Pihak Ketiga</strong>.
                </p>
              </div>

              {/* Option 4: Fitur Layar Belah (Split Screen) */}
              <div className="p-3 rounded-[10px] bg-[var(--bg-card)] border-[2px] border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] space-y-1">
                <span className="font-black text-[var(--accent-purple)] flex items-center gap-1">
                  ⚡ Alternatif Terbaik di HP (Tanpa Ganti Setelan):
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Gunakan fitur bawaan HP <strong>&quot;Split Screen / Layar Terbelah&quot;</strong> atau <strong>&quot;Pop-up View&quot;</strong> untuk membuka MarszLive sambil membuka aplikasi YouTube di bawahnya!
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="neo-btn neo-btn-primary w-full py-2.5 font-black text-xs shadow-[3px_3px_0px_var(--shadow-color)] mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Saya Mengerti & Siap Nonton</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
