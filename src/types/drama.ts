export type DramaProvider = 
  | 'dramabox'
  | 'pinedrama'
  | 'reelshort'
  | 'shortmax'
  | 'melolo'
  | 'freereels'
  | 'dramanova';

export interface UnifiedDrama {
  id: string;
  provider: DramaProvider;
  title: string;
  cover: string;
  description?: string;
  totalEpisodes?: number;
  tags?: string[];
  views?: string | number;
  score?: number | string;
  author?: string;
  releaseDate?: string;
  raw?: any;
}

export interface UnifiedEpisode {
  id: string | number;
  episodeNumber: number;
  title?: string;
  duration?: number;
  cover?: string;
  streamUrl?: string;
  qualities?: {
    quality: string | number;
    url: string;
    codec?: string;
  }[];
  subtitles?: {
    language: string;
    label: string;
    url: string;
  }[];
  raw?: any;
}

export interface DramaDetailData {
  drama: UnifiedDrama;
  episodes: UnifiedEpisode[];
  categories?: string[];
  recommendations?: UnifiedDrama[];
}

export interface WatchHistoryItem {
  id: string;
  provider: DramaProvider;
  title: string;
  cover: string;
  lastEpisodeNumber: number;
  lastEpisodeId: string | number;
  progressSeconds: number;
  durationSeconds: number;
  updatedAt: number;
}

export interface BookmarkItem {
  id: string;
  provider: DramaProvider;
  title: string;
  cover: string;
  totalEpisodes?: number;
  addedAt: number;
}
