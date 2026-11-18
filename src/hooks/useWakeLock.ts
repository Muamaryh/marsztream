'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Minimal valid 1x1 blank video-only MP4 (no audio track, so it never steals audio focus from YouTube embeds)
// Used ONLY as a fallback when navigator.wakeLock is unavailable (e.g. non-HTTPS LAN or legacy WebViews)
const SILENT_VIDEO_MP4 =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjc5NSA2YThhOWI2IC0gSC4yNjQvTVBFRy00 AVCIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDE3IC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MSByZWY9MyBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgzOjB4MTEzIG1lPWhtZXMgcy1tZT03 psyPTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGZjPTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz02IGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBubj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTEgYl9iaWFzPTAgZGlyZWN0PTEgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0yIGtleWludD0yNTAga2V5aW50X21pbj0xNSBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfTG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBub2lzZV9yZWR1Y3Rpb249MCBjcG1fYmaxPTAgY3BtX3JhdGU9MCB2YnZfbWF4cmF0ZT0wIHZidl9idWZzaXplPTAgY3JmX21heD0wLjAgbmFsX2hyZD1ub25lIGZpbGxlcj0wIGlwX3JhdGlvPTEuNDAgYXE9MTowLjAw';

interface UseWakeLockResult {
  isEnabled: boolean;
  isActive: boolean;
  toggleWakeLock: () => void;
  setWakeLockEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'marsz_screen_always_on';

export function useWakeLock(shouldKeepAwake: boolean = true): UseWakeLockResult {
  // Default TRUE: automatically keep screen on just like watching native YouTube
  const [isEnabled, setIsEnabledState] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);

  const sentinelRef = useRef<any>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const isRequestingRef = useRef<boolean>(false);

  // Restore user preference if saved (defaults to true)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'false') {
        setIsEnabledState(false);
      } else {
        setIsEnabledState(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const stopFallbackVideo = useCallback(() => {
    if (fallbackVideoRef.current) {
      try {
        fallbackVideoRef.current.pause();
        fallbackVideoRef.current.removeAttribute('src');
        fallbackVideoRef.current.load();
        fallbackVideoRef.current.remove();
      } catch {
        // ignore
      }
      fallbackVideoRef.current = null;
    }
  }, []);

  const startFallbackVideo = useCallback(async (): Promise<boolean> => {
    if (typeof document === 'undefined') return false;

    try {
      let video = fallbackVideoRef.current;
      if (!video) {
        video = document.createElement('video');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('loop', '');
        video.setAttribute('aria-hidden', 'true');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        (video as any).disablePictureInPicture = true;
        (video as any).disableRemotePlayback = true;
        video.style.position = 'fixed';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.001';
        video.style.pointerEvents = 'none';
        video.style.bottom = '0';
        video.style.right = '0';
        video.style.zIndex = '-1';

        // Prefer lightweight 1fps canvas stream if supported, else fallback data URI
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 2, 2);
        }

        if (typeof (canvas as any).captureStream === 'function') {
          video.srcObject = (canvas as any).captureStream(1);
        } else {
          video.src = SILENT_VIDEO_MP4;
        }

        document.body.appendChild(video);
        fallbackVideoRef.current = video;
      }

      if (video.paused) {
        await video.play();
      }
      setIsActive(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // ignore
      }
      sentinelRef.current = null;
    }
    stopFallbackVideo();
    setIsActive(false);
  }, [stopFallbackVideo]);

  const requestWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!isEnabled || !shouldKeepAwake) {
      await releaseWakeLock();
      return;
    }
    if (document.visibilityState !== 'visible') return;

    // Already actively locked via native WakeLock
    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsActive(true);
      return;
    }

    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    try {
      const nav = navigator as any;
      if (nav.wakeLock && typeof nav.wakeLock.request === 'function') {
        const sentinel = await nav.wakeLock.request('screen');
        sentinelRef.current = sentinel;
        stopFallbackVideo();
        setIsActive(true);

        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
            setIsActive(false);
          }
        });
        return;
      }
    } catch {
      // Native WakeLock rejected or unsupported in current context -> try fallback video
    } finally {
      isRequestingRef.current = false;
    }

    // Fallback for non-HTTPS LAN / WebViews without WakeLock API
    await startFallbackVideo();
  }, [isEnabled, shouldKeepAwake, releaseWakeLock, startFallbackVideo, stopFallbackVideo]);

  // Manage lifecycle, visibility recovery, iframe focus transitions, user gestures, and health check
  useEffect(() => {
    if (!isEnabled || !shouldKeepAwake) {
      releaseWakeLock();
      return;
    }

    // 1. Request immediately (works out-of-the-box without user gesture in modern browsers)
    requestWakeLock();

    // 2. Re-acquire whenever user returns to the tab/app or interacts with page/iframe
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    // Note: 'blur' on window fires when user taps INSIDE a cross-origin YouTube <iframe>!
    // Checking visibilityState === 'visible' on blur ensures WakeLock is active right when user taps Play on iframe.
    const handleWindowBlur = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    const handleUserGesture = () => {
      if (
        document.visibilityState === 'visible' &&
        (!sentinelRef.current || sentinelRef.current.released) &&
        (!fallbackVideoRef.current || fallbackVideoRef.current.paused)
      ) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    // 3. Periodic health check every 15s to guarantee screen never sleeps mid-stream
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    }, 15000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      releaseWakeLock();
    };
  }, [isEnabled, shouldKeepAwake, requestWakeLock, releaseWakeLock]);

  const setWakeLockEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }
  }, []);

  const toggleWakeLock = useCallback(() => {
    setWakeLockEnabled(!isEnabled);
  }, [isEnabled, setWakeLockEnabled]);

  return {
    isEnabled,
    isActive,
    toggleWakeLock,
    setWakeLockEnabled,
  };
}
