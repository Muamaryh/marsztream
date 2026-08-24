export interface Streamer {
  id: string; // e.g. 'windah', 'miawaug', 'deankt'
  name: string; // e.g. 'Windah Basudara'
  handle: string; // e.g. '@WindahBasudara'
  channelId?: string;
  avatar?: string;
  isCustom?: boolean;
}

export interface StreamerLiveStatus {
  handle: string;
  isLive: boolean;
  videoId?: string | null;
  title?: string | null;
  viewerCount?: string | number | null;
  avatar?: string | null;
  channelId?: string | null;
  lastChecked: number;
}

export type MultiViewLayout = '1' | '2' | '3' | '4';

export interface MultiViewSlot {
  slotIndex: number;
  streamerId: string;
}
