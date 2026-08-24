export interface ImeStream {
  id: string;
  videoId: string;
  channelName: string;
  channelHandle: string;
  avatar: string | null;
  title: string;
  viewers?: string | null;
  isLive: boolean;
  gangs: string[];
}

export interface ImeGang {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export type MultiViewLayout = '1' | '2' | '3' | '4';
