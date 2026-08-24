'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { DEFAULT_STREAMERS } from '@/data/defaultStreamers';

const STREAMERS_STORAGE_KEY = 'marsztream_yt_streamers';
const ACTIVE_STREAMER_KEY = 'marsztream_yt_active';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useYouTubeLive() {
  const [streamers, setStreamers] = useState<Streamer[]>(DEFAULT_STREAMERS);
  const [activeStreamerId, setActiveStreamerId] = useState<string>('windah');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load custom streamers & active streamer from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STREAMERS_STORAGE_KEY);
      if (stored) {
        setStreamers(JSON.parse(stored));
      }
      const storedActive = localStorage.getItem(ACTIVE_STREAMER_KEY);
      if (storedActive) {
        setActiveStreamerId(storedActive);
      }
    } catch (e) {
      console.error('Failed to load stored streamers:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Construct query string for polling
  const handlesQuery = streamers.map((s) => s.handle).join(',');
  const apiUrl = handlesQuery ? `/api/youtube/live?handles=${encodeURIComponent(handlesQuery)}` : null;

  // Poll live status every 60 seconds
  const { data, error, isLoading, mutate } = useSWR<{ statuses: Record<string, StreamerLiveStatus> }>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 60000, // 1 minute auto refresh
      revalidateOnFocus: true,
      dedupingInterval: 15000,
    }
  );

  const statuses = data?.statuses || {};

  // Active streamer object
  const activeStreamer = streamers.find((s) => s.id === activeStreamerId) || streamers[0];
  const activeStatus = activeStreamer
    ? statuses[activeStreamer.handle.toLowerCase()]
    : null;

  // Change active streamer
  const selectStreamer = (id: string) => {
    setActiveStreamerId(id);
    try {
      localStorage.setItem(ACTIVE_STREAMER_KEY, id);
    } catch (e) {
      // ignore
    }
  };

  // Add new streamer
  const addStreamer = (handleInput: string, nameInput?: string) => {
    let cleanHandle = handleInput.trim();
    if (cleanHandle.includes('youtube.com/')) {
      const match = cleanHandle.match(/@([a-zA-Z0-9_.-]+)/);
      if (match) cleanHandle = `@${match[1]}`;
    }
    if (!cleanHandle.startsWith('@')) {
      cleanHandle = `@${cleanHandle}`;
    }

    const id = cleanHandle.replace('@', '').toLowerCase();
    const existing = streamers.find((s) => s.handle.toLowerCase() === cleanHandle.toLowerCase());
    if (existing) {
      selectStreamer(existing.id);
      return existing;
    }

    const newStreamer: Streamer = {
      id,
      name: nameInput?.trim() || cleanHandle.replace('@', ''),
      handle: cleanHandle,
      isCustom: true,
    };

    const updated = [...streamers, newStreamer];
    setStreamers(updated);
    selectStreamer(newStreamer.id);

    try {
      localStorage.setItem(STREAMERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    mutate();
    return newStreamer;
  };

  // Remove streamer
  const removeStreamer = (id: string) => {
    const updated = streamers.filter((s) => s.id !== id);
    setStreamers(updated);
    if (activeStreamerId === id && updated.length > 0) {
      selectStreamer(updated[0].id);
    }
    try {
      localStorage.setItem(STREAMERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Reset to defaults
  const resetStreamers = () => {
    setStreamers(DEFAULT_STREAMERS);
    selectStreamer('windah');
    try {
      localStorage.removeItem(STREAMERS_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    mutate();
  };

  return {
    streamers,
    activeStreamer,
    activeStreamerId,
    activeStatus,
    statuses,
    isLoading,
    isLoaded,
    selectStreamer,
    addStreamer,
    removeStreamer,
    resetStreamers,
    refreshStatuses: () => mutate(),
  };
}
