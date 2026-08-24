'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Streamer, StreamerLiveStatus } from '@/types/streamer';
import { DEFAULT_STREAMERS } from '@/data/defaultStreamers';

const STREAMERS_STORAGE_KEY = 'marsztream_yt_streamers_v2';
const ACTIVE_STREAMER_KEY = 'marsztream_yt_active_v2';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface AddStreamerPayload {
  handle: string;
  name?: string;
  avatar?: string | null;
}

interface StreamerContextType {
  streamers: Streamer[];
  activeStreamer: Streamer;
  activeStreamerId: string;
  activeStatus: StreamerLiveStatus | null;
  statuses: Record<string, StreamerLiveStatus>;
  liveCount: number;
  isLoading: boolean;
  isLoaded: boolean;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectStreamer: (id: string) => void;
  addStreamer: (payload: AddStreamerPayload | string) => Streamer | undefined;
  removeStreamer: (id: string) => void;
  resetStreamers: () => void;
  refreshStatuses: () => void;
}

const StreamerContext = createContext<StreamerContextType | undefined>(undefined);

export function StreamerProvider({ children }: { children: React.ReactNode }) {
  const [streamers, setStreamers] = useState<Streamer[]>(DEFAULT_STREAMERS);
  const [activeStreamerId, setActiveStreamerId] = useState<string>('windah');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load custom streamers & active streamer from localStorage, merging with latest default avatars
  useEffect(() => {
    try {
      localStorage.removeItem('marsztream_yt_streamers');

      const stored = localStorage.getItem(STREAMERS_STORAGE_KEY);
      if (stored) {
        const parsed: Streamer[] = JSON.parse(stored);
        const customStreamers = parsed.filter((s) => s.isCustom);
        // Merge defaults with custom streamers
        const merged = [...DEFAULT_STREAMERS, ...customStreamers];
        setStreamers(merged);
      } else {
        setStreamers(DEFAULT_STREAMERS);
      }

      const storedActive = localStorage.getItem(ACTIVE_STREAMER_KEY);
      if (storedActive) {
        setActiveStreamerId(storedActive);
      }
    } catch (e) {
      console.error('Failed to load stored streamers:', e);
      setStreamers(DEFAULT_STREAMERS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Construct query string for polling
  const handlesQuery = streamers.map((s) => s.handle).join(',');
  const apiUrl = handlesQuery ? `/api/youtube/live?handles=${encodeURIComponent(handlesQuery)}` : null;

  // Poll live status every 45 seconds
  const { data, error, isLoading, mutate } = useSWR<{ statuses: Record<string, StreamerLiveStatus> }>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 45000, // 45s
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

  const liveCount = Object.values(statuses).filter((s) => s.isLive).length;

  // Change active streamer
  const selectStreamer = (id: string) => {
    setActiveStreamerId(id);
    try {
      localStorage.setItem(ACTIVE_STREAMER_KEY, id);
    } catch (e) {
      // ignore
    }
  };

  // Add new streamer with auto-parsed handle, name, and avatar
  const addStreamer = (payload: AddStreamerPayload | string) => {
    const rawHandle = typeof payload === 'string' ? payload : payload.handle;
    const customName = typeof payload === 'string' ? undefined : payload.name;
    const customAvatar = typeof payload === 'string' ? undefined : payload.avatar;

    let cleanHandle = rawHandle.trim();
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
      // Update avatar if provided
      if (customAvatar && !existing.avatar) {
        existing.avatar = customAvatar;
      }
      selectStreamer(existing.id);
      return existing;
    }

    const newStreamer: Streamer = {
      id,
      name: customName?.trim() || cleanHandle.replace('@', ''),
      handle: cleanHandle,
      avatar: customAvatar || undefined,
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

  return (
    <StreamerContext.Provider
      value={{
        streamers,
        activeStreamer,
        activeStreamerId,
        activeStatus,
        statuses,
        liveCount,
        isLoading,
        isLoaded,
        isAddModalOpen,
        setIsAddModalOpen,
        selectStreamer,
        addStreamer,
        removeStreamer,
        resetStreamers,
        refreshStatuses: () => mutate(),
      }}
    >
      {children}
    </StreamerContext.Provider>
  );
}

export function useStreamer() {
  const context = useContext(StreamerContext);
  if (!context) {
    throw new Error('useStreamer must be used within a StreamerProvider');
  }
  return context;
}
