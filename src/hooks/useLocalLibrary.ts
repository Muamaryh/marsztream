'use client';

import { useState, useEffect } from 'react';
import { WatchHistoryItem, BookmarkItem, DramaProvider, UnifiedDrama } from '@/types/drama';

const HISTORY_KEY = 'marsztream_watch_history';
const BOOKMARKS_KEY = 'marsztream_bookmarks';

export function useLocalLibrary() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    } catch (e) {
      console.error('Failed to load local library:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveHistory = (
    drama: UnifiedDrama,
    episodeNumber: number,
    episodeId: string | number,
    progressSeconds: number,
    durationSeconds: number
  ) => {
    if (!drama?.id) return;
    try {
      const currentList = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const filtered = currentList.filter(
        (item: WatchHistoryItem) => !(item.id === drama.id && item.provider === drama.provider)
      );

      const newItem: WatchHistoryItem = {
        id: drama.id,
        provider: drama.provider,
        title: drama.title,
        cover: drama.cover,
        lastEpisodeNumber: episodeNumber,
        lastEpisodeId: episodeId,
        progressSeconds: Math.floor(progressSeconds),
        durationSeconds: Math.floor(durationSeconds),
        updatedAt: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (e) {
      console.error('Failed to save watch history:', e);
    }
  };

  const removeHistoryItem = (id: string, provider: DramaProvider) => {
    try {
      const updated = history.filter(
        (item) => !(item.id === id && item.provider === provider)
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch (e) {
      console.error('Failed to remove history item:', e);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const toggleBookmark = (drama: UnifiedDrama) => {
    if (!drama?.id) return;
    try {
      const isBookmarked = bookmarks.some(
        (b) => b.id === drama.id && b.provider === drama.provider
      );

      let updated: BookmarkItem[];
      if (isBookmarked) {
        updated = bookmarks.filter(
          (b) => !(b.id === drama.id && b.provider === drama.provider)
        );
      } else {
        const newItem: BookmarkItem = {
          id: drama.id,
          provider: drama.provider,
          title: drama.title,
          cover: drama.cover,
          totalEpisodes: drama.totalEpisodes,
          addedAt: Date.now(),
        };
        updated = [newItem, ...bookmarks];
      }

      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      setBookmarks(updated);
      return !isBookmarked;
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
      return false;
    }
  };

  const isBookmarked = (id: string, provider: DramaProvider) => {
    return bookmarks.some((b) => b.id === id && b.provider === provider);
  };

  return {
    history,
    bookmarks,
    isLoaded,
    saveHistory,
    removeHistoryItem,
    clearHistory,
    toggleBookmark,
    isBookmarked,
  };
}
