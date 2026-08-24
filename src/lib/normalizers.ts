import { UnifiedDrama, UnifiedEpisode, DramaProvider } from '@/types/drama';

/**
 * Normalizes raw API response lists from different providers into UnifiedDrama[]
 */
export function normalizeDramaList(provider: DramaProvider, rawData: any): UnifiedDrama[] {
  if (!rawData) return [];

  try {
    switch (provider) {
      case 'dramabox': {
        const items = Array.isArray(rawData) ? rawData : (rawData.data?.list || rawData.list || rawData.data || []);
        return items.map((item: any) => ({
          id: String(item.bookId || item.id || ''),
          provider: 'dramabox' as DramaProvider,
          title: item.bookName || item.title || 'Untitled Drama',
          cover: item.coverWap || item.cover || item.bookPic || '',
          description: item.introduction || item.summary || '',
          totalEpisodes: item.chapterCount || item.totalChapter || item.episodesCount || 0,
          tags: item.tags || (item.tagNames ? item.tagNames.split(',') : []),
          views: item.readCount || item.playCount || item.views || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'pinedrama': {
        const collections = rawData.collections || rawData.data || (Array.isArray(rawData) ? rawData : []);
        return collections.map((item: any) => ({
          id: String(item.collection_id || item.id || ''),
          provider: 'pinedrama' as DramaProvider,
          title: item.title || 'Untitled Drama',
          cover: item.cover_url || item.cover || item.horizontal_cover_url || '',
          description: item.description || '',
          totalEpisodes: item.total_episodes || item.episodes_count || 0,
          tags: typeof item.categories === 'string' ? item.categories.split(',').map((s: string) => s.trim()) : (item.tags || []),
          views: item.views ? `${Number(item.views).toLocaleString('id-ID')} tayangan` : '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'reelshort': {
        const lists = rawData.lists || rawData.data || rawData.items || (Array.isArray(rawData) ? rawData : []);
        return lists.map((item: any) => ({
          id: String(item.book_id || item.bookId || item.id || ''),
          provider: 'reelshort' as DramaProvider,
          title: item.book_title || item.title || item.bookName || 'Untitled Drama',
          cover: item.book_pic || item.cover || item.coverWap || '',
          description: item.summary || item.introduction || '',
          totalEpisodes: item.chapter_count || item.total_chapter || 0,
          tags: item.tag_list || item.tags || [],
          views: item.read_count || item.play_count || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'shortmax': {
        const results = rawData.results || rawData.data || (Array.isArray(rawData) ? rawData : []);
        return results.map((item: any) => ({
          id: String(item.shortPlayId || item.id || ''),
          provider: 'shortmax' as DramaProvider,
          title: item.name || item.title || 'Untitled Drama',
          cover: item.cover || item.coverWap || '',
          description: item.intro || item.description || '',
          totalEpisodes: item.totalEpisodes || item.episodeCount || item.episodes || 0,
          tags: item.tags || item.tagList || [],
          views: item.playCount || item.hotNum || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'melolo': {
        const items = Array.isArray(rawData) ? rawData : (rawData.data || rawData.list || rawData.items || []);
        return items.map((item: any) => ({
          id: String(item.book_id || item.bookId || item.id || ''),
          provider: 'melolo' as DramaProvider,
          title: item.book_name || item.title || item.name || 'Untitled Drama',
          cover: item.thumb_url || item.cover || item.cover_url || '',
          description: item.abstract || item.description || '',
          totalEpisodes: item.serial_count || item.episode_count || 0,
          tags: item.tags || (item.category ? [item.category] : []),
          views: item.play_count || item.read_count || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'freereels': {
        const items = Array.isArray(rawData) ? rawData : (rawData.data || rawData.list || rawData.items || []);
        return items.map((item: any) => ({
          id: String(item.key || item.id || item.bookId || ''),
          provider: 'freereels' as DramaProvider,
          title: item.title || item.name || 'Untitled Drama',
          cover: item.cover || item.cover_url || item.image || '',
          description: item.desc || item.description || '',
          totalEpisodes: item.total_episodes || item.episodes_count || item.episode_count || 0,
          tags: item.tags || item.categories || [],
          views: item.views || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      case 'dramanova': {
        const items = Array.isArray(rawData) ? rawData : (rawData.data || rawData.list || rawData.items || []);
        return items.map((item: any) => ({
          id: String(item.dramaId || item.id || ''),
          provider: 'dramanova' as DramaProvider,
          title: item.title || item.name || 'Untitled Drama',
          cover: item.cover || item.poster || item.coverUrl || '',
          description: item.description || item.intro || '',
          totalEpisodes: item.episodesCount || item.total_episodes || 0,
          tags: item.tags || item.genres || [],
          views: item.views || item.hot || '',
          raw: item,
        })).filter((d: UnifiedDrama) => d.id && d.cover);
      }

      default:
        return [];
    }
  } catch (err) {
    console.error(`Error normalizing drama list for ${provider}:`, err);
    return [];
  }
}
