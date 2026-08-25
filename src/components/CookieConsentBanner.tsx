'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  CheckCircle2, 
  X, 
  HelpCircle, 
  Smartphone, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detectedBrowser, setDetectedBrowser] = useState<string>('all');

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('marsz_cookie_sync_dismissed');
      if (!isDismissed) {
        // Show after 1 second
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {}

    // Detect browser
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua) || (ua.includes('safari') && !ua.includes('chrome'))) {
        setDetectedBrowser('safari');
      } else if (ua.includes('brave') || (navigator as any).brave) {
        setDetectedBrowser('brave');
      } else if (/android/.test(ua)) {
        setDetectedBrowser('android');
      } else if (ua.includes('firefox')) {
        setDetectedBrowser('firefox');
      } else {
        setDetectedBrowser('chrome');
      }
    }
  }, []);

  const handleAccept = async () => {
    // Attempt Storage Access API if supported by browser (Safari / Firefox / Edge)
    if (typeof document !== 'undefined' && 'requestStorageAccess' in document) {
      try {
        await (document as any).requestStorageAccess();
      } catch (e) {
        // fallback
      }
    }

    try {
      localStorage.setItem('marsz_cookie_sync_dismissed', 'true');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('marsz_cookie_sync_dismissed', 'true');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="neo-card bg-[var(--bg-card)] border-[3px] border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] p-4 sm:p-5 space-y-3">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--primary)] border-[2px] border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
              <Cookie className="w-5 h-5 text-[#18181b]" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-1.5">
                <span>Sinkronisasi Live Chat YouTube</span>
                <span className="neo-badge bg-[var(--accent-mint)] text-[9px] px-1.5 py-0">
                  Tips
                </span>
              </h4>
              <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">
                Bisa kirim chat langsung dari web tanpa login ulang / tab baru.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-[6px] bg-[var(--bg-canvas)] border-[1.5px] border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-red)] hover:text-white transition-colors shrink-0"
            title="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Short explanation */}
        <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-relaxed">
          Browser selain Chrome (seperti <strong>Safari iPhone, Brave, Samsung Internet</strong>) secara bawaan membatasi cookie pihak ketiga sehingga kotak chat meminta login.
        </p>

        {/* Toggle Detailed Guide Accordion */}
        {showDetail && (
          <div className="p-3 bg-[var(--bg-canvas)] rounded-[12px] border-[2px] border-[var(--border-color)] space-y-2 text-[11px] text-[var(--text-main)] font-semibold max-h-48 overflow-y-auto">
            <p className="font-black text-xs text-[var(--text-main)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              Cara Aktifkan Cookie di Browser Kamu:
            </p>

            {detectedBrowser === 'safari' && (
              <div className="p-2 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="font-black text-[var(--accent-red)] block">🍎 Safari / iPhone:</span>
                Buka <strong>Pengaturan (Settings)</strong> ➡️ <strong>Safari</strong> ➡️ matikan (OFF) <strong>&quot;Prevent Cross-Site Tracking&quot;</strong>.
              </div>
            )}

            {detectedBrowser === 'brave' && (
              <div className="p-2 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="font-black text-[var(--accent-mint)] block">🦁 Brave Browser:</span>
                Klik ikon <strong>Brave Shields</strong> di sebelah address bar ➡️ ubah jadi <strong>&quot;Allow Cookies&quot;</strong>.
              </div>
            )}

            {detectedBrowser === 'android' && (
              <div className="p-2 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="font-black text-[var(--accent-blue)] block">📱 Chrome / Samsung Internet:</span>
                Setelan Browser ➡️ <strong>Setelan Situs / Privasi</strong> ➡️ <strong>Cookie Pihak Ketiga</strong> ➡️ pilih <strong>Izinkan</strong>.
              </div>
            )}

            {detectedBrowser !== 'safari' && detectedBrowser !== 'brave' && detectedBrowser !== 'android' && (
              <div className="p-2 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="font-black text-[var(--accent-purple)] block">🌐 Pengguna Umum:</span>
                Izinkan cookie pihak ketiga untuk <code>youtube.com</code> pada setelan privasi browser.
              </div>
            )}

            <div className="p-2 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border-color)]">
              <span className="font-black text-[var(--accent-yellow)] text-[#18181b] block">💡 Alternatif HP:</span>
              Gunakan fitur bawaan HP <strong>&quot;Split Screen / Layar Belah&quot;</strong> untuk membuka MarszLive &amp; aplikasi YouTube sekaligus.
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            onClick={handleAccept}
            className="neo-btn neo-btn-primary flex-1 py-2 text-xs font-black shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aktifkan &amp; Mengerti</span>
          </button>

          <button
            onClick={() => setShowDetail(!showDetail)}
            className="neo-btn neo-btn-secondary py-2 px-3 text-xs font-black shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <span>{showDetail ? 'Sembunyikan' : 'Petunjuk'}</span>
            {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </div>
  );
}
