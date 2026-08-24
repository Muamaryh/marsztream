import useSWR from 'swr';
import { DramaProvider, UnifiedDrama, UnifiedEpisode, DramaDetailData } from '@/types/drama';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

export function useDramaDetail(provider: DramaProvider, id: string) {
  let detailEndpoint: string | null = null;
  let episodesEndpoint: string | null = null;

  if (id) {
    switch (provider) {
      case 'dramabox':
        detailEndpoint = `/api/dramabox/detail?bookId=${id}`;
        episodesEndpoint = `/api/dramabox/allepisode?bookId=${id}`;
        break;
      case 'pinedrama':
        detailEndpoint = `/api/pinedrama/detail?collection_id=${id}`;
        break;
      case 'reelshort':
        detailEndpoint = `/api/reelshort/detail?bookId=${id}`;
        break;
      case 'shortmax':
        detailEndpoint = `/api/shortmax/detail?shortPlayId=${id}`;
        break;
      case 'melolo':
        detailEndpoint = `/api/melolo/detail?book_id=${id}`;
        break;
      case 'freereels':
        detailEndpoint = `/api/freereels/detailAndAllEpisode?key=${id}`;
        break;
      case 'dramanova':
        detailEndpoint = `/api/dramanova/detail?dramaId=${id}`;
        break;
    }
  }

  const { data: rawDetail, error: detailError, isLoading: detailLoading } = useSWR(
    detailEndpoint,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const { data: rawEpisodes, error: episodesError, isLoading: episodesLoading } = useSWR(
    episodesEndpoint,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  // Normalize Detail & Episodes
  let detailData: DramaDetailData | null = null;

  if (rawDetail) {
    try {
      detailData = normalizeDetail(provider, id, rawDetail, rawEpisodes);
    } catch (err) {
      console.error(`Error normalizing detail for ${provider}/${id}:`, err);
    }
  }

  return {
    data: detailData,
    rawDetail,
    rawEpisodes,
    isLoading: detailLoading || (episodesEndpoint ? episodesLoading : false),
    isError: !!detailError || !!episodesError,
    error: detailError || episodesError,
  };
}

function normalizeDetail(
  provider: DramaProvider,
  id: string,
  rawDetail: any,
  rawEpisodes?: any
): DramaDetailData {
  let drama: UnifiedDrama = {
    id,
    provider,
    title: 'Untitled Drama',
    cover: '',
  };
  let episodes: UnifiedEpisode[] = [];
  let categories: string[] = [];

  switch (provider) {
    case 'dramabox': {
      const book = rawDetail.data?.book || rawDetail.book || rawDetail;
      drama = {
        id,
        provider: 'dramabox',
        title: book.bookName || book.title || 'DramaBox Drama',
        cover: book.coverWap || book.cover || '',
        description: book.introduction || book.summary || '',
        totalEpisodes: book.chapterCount || (rawEpisodes?.length || 0),
        tags: book.tags || (book.tagNames ? book.tagNames.split(',') : []),
        views: book.readCount || '',
        raw: book,
      };

      if (Array.isArray(rawEpisodes)) {
        episodes = rawEpisodes.map((ep: any, index: number) => {
          const episodeNum = ep.chapterIndex !== undefined ? ep.chapterIndex + 1 : index + 1;
          const defaultCdn = ep.cdnList?.find((c: any) => c.isDefault === 1) || ep.cdnList?.[0];
          
          const qualities = defaultCdn?.videoPathList?.map((v: any) => ({
            quality: v.quality || 720,
            url: v.videoPath || '',
            codec: v.codec,
          })) || [];

          const subtitles = ep.subLanguageVoList?.map((s: any) => ({
            language: s.captionLanguage,
            label: s.captionLanguage === 'in' ? 'Bahasa Indonesia' : s.captionLanguage === 'en' ? 'English' : s.captionLanguage,
            url: s.url,
          })).filter((s: any) => s.url) || [];

          return {
            id: ep.chapterId || `${id}-${episodeNum}`,
            episodeNumber: episodeNum,
            title: ep.chapterName || `Episode ${episodeNum}`,
            cover: ep.chapterCover || drama.cover,
            duration: ep.duration,
            qualities,
            subtitles,
            raw: ep,
          };
        });
      }
      break;
    }

    case 'pinedrama': {
      const item = rawDetail.data || rawDetail;
      const col = item.collection || item;
      drama = {
        id,
        provider: 'pinedrama',
        title: col.title || 'PineDrama',
        cover: col.cover_url || col.cover || col.horizontal_cover_url || '',
        description: col.description || '',
        totalEpisodes: col.total_episodes || item.episodes?.length || 0,
        tags: typeof col.categories === 'string' ? col.categories.split(',').map((s: string) => s.trim()) : (col.tags || []),
        views: col.views ? `${Number(col.views).toLocaleString('id-ID')} tayangan` : '',
        raw: item,
      };

      const epList = item.episodes || rawDetail.episodes || [];
      if (Array.isArray(epList) && epList.length > 0) {
        episodes = epList.map((ep: any, idx: number) => ({
          id: ep.episode_id || ep.id || `${id}-${idx + 1}`,
          episodeNumber: ep.episode_number || idx + 1,
          title: ep.title || `Episode ${ep.episode_number || idx + 1}`,
          cover: ep.cover_url || drama.cover,
          streamUrl: ep.video_url || ep.stream_url || '',
          raw: ep,
        }));
      } else {
        // Generate placeholder episodes if list is indexed by total_episodes
        const total = drama.totalEpisodes || 1;
        episodes = Array.from({ length: total }, (_, i) => ({
          id: `${id}-${i + 1}`,
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
          cover: drama.cover,
        }));
      }
      break;
    }

    case 'reelshort': {
      const book = rawDetail.data?.book || rawDetail.book || rawDetail;
      drama = {
        id,
        provider: 'reelshort',
        title: book.book_title || book.title || 'ReelShort Drama',
        cover: book.book_pic || book.cover || '',
        description: book.summary || book.introduction || '',
        totalEpisodes: book.chapter_count || 0,
        tags: book.tag_list || book.tags || [],
        views: book.read_count || '',
        raw: book,
      };

      const total = drama.totalEpisodes || 1;
      episodes = Array.from({ length: total }, (_, i) => ({
        id: `${id}-${i + 1}`,
        episodeNumber: i + 1,
        title: `Episode ${i + 1}`,
        cover: drama.cover,
      }));
      break;
    }

    case 'shortmax': {
      const sp = rawDetail.data || rawDetail;
      drama = {
        id,
        provider: 'shortmax',
        title: sp.name || sp.title || 'ShortMax Drama',
        cover: sp.cover || sp.coverWap || '',
        description: sp.intro || sp.description || '',
        totalEpisodes: sp.totalEpisodes || sp.episodeCount || 0,
        tags: sp.tags || sp.tagList || [],
        views: sp.playCount || '',
        raw: sp,
      };

      const total = drama.totalEpisodes || 1;
      episodes = Array.from({ length: total }, (_, i) => ({
        id: `${id}-${i + 1}`,
        episodeNumber: i + 1,
        title: `Episode ${i + 1}`,
        cover: drama.cover,
      }));
      break;
    }

    case 'melolo': {
      const book = rawDetail.data?.book || rawDetail.book || rawDetail;
      drama = {
        id,
        provider: 'melolo',
        title: book.book_name || book.title || 'Melolo Drama',
        cover: book.thumb_url || book.cover || '',
        description: book.abstract || book.description || '',
        totalEpisodes: book.serial_count || 0,
        tags: book.tags || (book.category ? [book.category] : []),
        views: book.play_count || '',
        raw: book,
      };

      const chapterList = rawDetail.data?.chapter_list || rawDetail.chapter_list || rawDetail.episodes || [];
      if (Array.isArray(chapterList) && chapterList.length > 0) {
        episodes = chapterList.map((ep: any, idx: number) => ({
          id: ep.vid || ep.videoId || ep.chapter_id || `${id}-${idx + 1}`,
          episodeNumber: ep.index !== undefined ? ep.index + 1 : idx + 1,
          title: ep.title || `Episode ${idx + 1}`,
          cover: ep.cover || drama.cover,
          raw: ep,
        }));
      } else {
        const total = drama.totalEpisodes || 1;
        episodes = Array.from({ length: total }, (_, i) => ({
          id: `${id}-${i + 1}`,
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
          cover: drama.cover,
        }));
      }
      break;
    }

    case 'freereels': {
      const item = rawDetail.data || rawDetail;
      drama = {
        id,
        provider: 'freereels',
        title: item.title || item.name || 'FreeReels Drama',
        cover: item.cover || item.cover_url || item.image || '',
        description: item.desc || item.description || '',
        totalEpisodes: item.total_episodes || item.episodes?.length || 0,
        tags: item.tags || item.categories || [],
        views: item.views || '',
        raw: item,
      };

      const epList = item.episodes || item.episode_list || [];
      if (Array.isArray(epList)) {
        episodes = epList.map((ep: any, idx: number) => ({
          id: ep.id || ep.key || `${id}-${idx + 1}`,
          episodeNumber: ep.episode_number || ep.episode || idx + 1,
          title: ep.title || `Episode ${ep.episode_number || idx + 1}`,
          cover: ep.cover || drama.cover,
          streamUrl: ep.stream_url || ep.video_url || ep.url || '',
          subtitles: ep.subtitles?.map((s: any) => ({
            language: s.lang,
            label: s.lang_name || s.lang,
            url: s.url,
          })) || [],
          raw: ep,
        }));
      }
      break;
    }

    case 'dramanova': {
      const item = rawDetail.data || rawDetail;
      drama = {
        id,
        provider: 'dramanova',
        title: item.title || item.name || 'DramaNova',
        cover: item.cover || item.poster || '',
        description: item.description || item.intro || '',
        totalEpisodes: item.episodesCount || (item.fileList?.length || 0),
        tags: item.tags || item.genres || [],
        views: item.views || '',
        raw: item,
      };

      const files = item.fileList || item.episodes || [];
      if (Array.isArray(files)) {
        episodes = files.map((file: any, idx: number) => ({
          id: file.fileId || file.id || `${id}-${idx + 1}`,
          episodeNumber: file.episodeNumber || file.order || idx + 1,
          title: file.title || `Episode ${file.episodeNumber || idx + 1}`,
          cover: file.cover || drama.cover,
          raw: file,
        }));
      }
      break;
    }
  }

  return { drama, episodes, categories };
}
