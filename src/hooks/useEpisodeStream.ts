import useSWR from 'swr';
import { DramaProvider, UnifiedEpisode } from '@/types/drama';

interface StreamResult {
  streamUrl: string | null;
  qualities?: { label: string; url: string; quality: number }[];
  subtitles?: { language: string; label: string; url: string }[];
  isHls?: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

export function useEpisodeStream(
  provider: DramaProvider,
  dramaId: string,
  episodeNumber: number,
  episodeData?: UnifiedEpisode | null
) {
  // Determine if we need to call an endpoint to get the video URL
  let streamEndpoint: string | null = null;

  if (dramaId && episodeNumber > 0) {
    switch (provider) {
      case 'dramabox': {
        // If we have an encrypted video url from allepisode, decrypt it
        const defaultQualityUrl = episodeData?.qualities?.[0]?.url;
        if (defaultQualityUrl) {
          streamEndpoint = `/api/dramabox/decrypt?url=${encodeURIComponent(defaultQualityUrl)}`;
        }
        break;
      }
      case 'pinedrama': {
        streamEndpoint = `/api/pinedrama/episode?collection_id=${dramaId}&episodeNumber=${episodeNumber}`;
        break;
      }
      case 'reelshort': {
        streamEndpoint = `/api/reelshort/episode?bookId=${dramaId}&episodeNumber=${episodeNumber}&lang=id`;
        break;
      }
      case 'shortmax': {
        streamEndpoint = `/api/shortmax/episode?shortPlayId=${dramaId}&episodeNumber=${episodeNumber}&lang=id`;
        break;
      }
      case 'melolo': {
        const vid = episodeData?.id || episodeData?.raw?.vid;
        if (vid) {
          streamEndpoint = `/api/melolo/episode?videoId=${vid}`;
        }
        break;
      }
      case 'dramanova': {
        const fileId = episodeData?.id || episodeData?.raw?.fileId;
        if (fileId) {
          streamEndpoint = `/api/dramanova/getvideo?fileId=${fileId}`;
        }
        break;
      }
      case 'freereels': {
        // FreeReels already supplies the stream URL in the episode object
        break;
      }
    }
  }

  const { data, error, isLoading } = useSWR(
    streamEndpoint,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 } // 10 mins
  );

  let result: StreamResult = {
    streamUrl: null,
    qualities: [],
    subtitles: episodeData?.subtitles || [],
    isHls: false,
  };

  // Case 1: FreeReels (direct from episodeData)
  if (provider === 'freereels') {
    if (episodeData?.streamUrl) {
      result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(episodeData.streamUrl)}`;
      result.isHls = episodeData.streamUrl.includes('.m3u8');
    }
    return {
      stream: result,
      isLoading: false,
      isError: false,
    };
  }

  // Case 2: Process response based on provider
  if (data) {
    switch (provider) {
      case 'dramabox': {
        // data contains decrypted stream URL or qualities
        const decryptedUrl = typeof data === 'string' ? data : (data.url || data.streamUrl || data.data?.url);
        if (decryptedUrl) {
          result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(decryptedUrl)}`;
        }
        // Format qualities list
        if (episodeData?.qualities?.length) {
          result.qualities = episodeData.qualities.map(q => ({
            label: `${q.quality}p`,
            quality: Number(q.quality) || 720,
            url: `/api/dramabox/decrypt?url=${encodeURIComponent(q.url)}`,
          }));
        }
        break;
      }

      case 'pinedrama': {
        const item = data.data || data;
        const rawUrl = item.video_url || item.stream_url || item.url || (typeof data === 'string' ? data : '');
        if (rawUrl) {
          result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(rawUrl)}`;
          result.isHls = rawUrl.includes('.m3u8');
        }
        break;
      }

      case 'reelshort': {
        const item = data.data || data;
        const rawUrl = item.video_url || item.url || item.stream_url || item.play_url || (typeof data === 'string' ? data : '');
        if (rawUrl) {
          result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(rawUrl)}`;
          result.isHls = rawUrl.includes('.m3u8');
        }
        break;
      }

      case 'shortmax': {
        const item = data.data || data;
        const rawUrl = item.playUrl || item.url || item.videoUrl || item.m3u8 || (typeof data === 'string' ? data : '');
        if (rawUrl) {
          // Pass ShortMax m3u8 through our ShortMax HLS decryptor proxy
          result.streamUrl = `/api/shortmax/hls?url=${encodeURIComponent(rawUrl)}`;
          result.isHls = true;
        }
        break;
      }

      case 'melolo': {
        const item = data.data || data;
        const rawUrl = item.streamUrl || item.url || item.video_url || (typeof data === 'string' ? data : '');
        if (rawUrl) {
          result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(rawUrl)}`;
          result.isHls = rawUrl.includes('.m3u8');
        }
        if (Array.isArray(item.qualities)) {
          result.qualities = item.qualities.map((q: any) => ({
            label: q.definition || `${q.resolution || 720}p`,
            quality: parseInt(q.resolution) || 720,
            url: `/api/proxy/video?url=${encodeURIComponent(q.streamUrl)}`,
          }));
        }
        break;
      }

      case 'dramanova': {
        const item = data.data || data;
        const rawUrl = item.videoUrl || item.url || item.streamUrl || (typeof data === 'string' ? data : '');
        if (rawUrl) {
          result.streamUrl = `/api/proxy/video?url=${encodeURIComponent(rawUrl)}`;
          result.isHls = rawUrl.includes('.m3u8');
        }
        break;
      }
    }
  }

  return {
    stream: result,
    raw: data,
    isLoading: !!streamEndpoint && isLoading,
    isError: !!error,
    error,
  };
}
