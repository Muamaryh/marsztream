'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { ImeStream, ImeGang, MultiViewLayout } from '@/types/imerp';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ImeRPContextType {
  streams: ImeStream[];
  gangs: ImeGang[];
  totalLive: number;
  activeStream: ImeStream | null;
  activeStreamId: string;
  selectedGang: string;
  searchQuery: string;
  filteredStreams: ImeStream[];
  layout: MultiViewLayout;
  isLoading: boolean;
  setLayout: (layout: MultiViewLayout) => void;
  setSelectedGang: (gang: string) => void;
  setSearchQuery: (q: string) => void;
  selectStream: (id: string) => void;
  refresh: () => void;
}

const ImeRPContext = createContext<ImeRPContextType | undefined>(undefined);

export function ImeRPProvider({ children }: { children: React.ReactNode }) {
  const [activeStreamId, setActiveStreamId] = useState<string>('');
  const [selectedGang, setSelectedGangState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layout, setLayoutState] = useState<MultiViewLayout>('1');

  // Restore saved gang and layout preferences on mount
  useEffect(() => {
    try {
      const savedGang = localStorage.getItem('imerp_selected_gang');
      if (savedGang) {
        setSelectedGangState(savedGang);
      }
      const savedLayout = localStorage.getItem('imerp_layout') as MultiViewLayout;
      if (savedLayout && ['1', '2', '3', '4'].includes(savedLayout)) {
        setLayoutState(savedLayout);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setSelectedGang = (gang: string) => {
    setSelectedGangState(gang);
    try {
      localStorage.setItem('imerp_selected_gang', gang);
    } catch (e) {
      // ignore
    }
  };

  const setLayout = (newLayout: MultiViewLayout) => {
    setLayoutState(newLayout);
    try {
      localStorage.setItem('imerp_layout', newLayout);
    } catch (e) {
      // ignore
    }
  };

  // Poll IME RP live streams every 15 seconds
  const { data, isLoading, mutate } = useSWR<{
    streams: ImeStream[];
    gangs: ImeGang[];
    totalLive: number;
  }>('/api/youtube/imerp', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const streams = data?.streams || [];
  const gangs = data?.gangs || [];
  const totalLive = data?.totalLive || streams.length;

  // Active Stream object
  const activeStream = useMemo(() => {
    if (!streams.length) return null;
    return streams.find((s) => s.id === activeStreamId) || streams[0];
  }, [streams, activeStreamId]);

  // Filter streams by selected Gang and search query
  const filteredStreams = useMemo(() => {
    let list = streams;

    // Filter by Gang
    if (selectedGang !== 'ALL') {
      list = list.filter((s) => s.gangs.includes(selectedGang));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.channelName.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.gangs.some((g) => g.toLowerCase().includes(q))
      );
    }

    return list;
  }, [streams, selectedGang, searchQuery]);

  const selectStream = (id: string) => {
    setActiveStreamId(id);
  };

  const handleForceRefresh = async () => {
    try {
      const res = await fetch(`/api/youtube/imerp?force=1&t=${Date.now()}`);
      const freshData = await res.json();
      mutate(freshData, false);
    } catch (e) {
      mutate();
    }
  };

  return (
    <ImeRPContext.Provider
      value={{
        streams,
        gangs,
        totalLive,
        activeStream,
        activeStreamId: activeStream?.id || '',
        selectedGang,
        searchQuery,
        filteredStreams,
        layout,
        isLoading,
        setLayout,
        setSelectedGang,
        setSearchQuery,
        selectStream,
        refresh: handleForceRefresh,
      }}
    >
      {children}
    </ImeRPContext.Provider>
  );
}

export function useImeRP() {
  const context = useContext(ImeRPContext);
  if (!context) {
    throw new Error('useImeRP must be used within an ImeRPProvider');
  }
  return context;
}
