import { NextRequest, NextResponse } from 'next/server';
import { StreamerLiveStatus } from '@/types/streamer';

export const dynamic = 'force-dynamic';

interface CacheItem {
  data: StreamerLiveStatus;
  expiresAt: number;
}

const statusCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function checkSingleChannel(handleOrId: string): Promise<StreamerLiveStatus> {
  const cleanHandle = handleOrId.trim();
  const normalizedHandle = cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`;

  // 1. Check cache
  const cached = statusCache.get(normalizedHandle.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const now = Date.now();
  const fallbackStatus: StreamerLiveStatus = {
    handle: normalizedHandle,
    isLive: false,
    videoId: null,
    title: null,
    avatar: null,
    channelId: null,
    lastChecked: now,
  };

  try {
    const url = `https://www.youtube.com/${normalizedHandle}/live`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    const html = await res.text();
    const finalUrl = res.url;

    // 1. Extract video ID if redirected or embedded
    const matchWatch = finalUrl.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    const matchCanonical = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/
    );
    const matchLiveVideo = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = matchWatch ? matchWatch[1] : matchCanonical ? matchCanonical[1] : matchLiveVideo ? matchLiveVideo[1] : null;

    // 2. Check if actually live
    const isLive =
      html.includes('"isLive":true') ||
      html.includes('"isLiveContent":true') ||
      (html.includes('"style":"LIVE"') && html.includes('"iconType":"LIVE"'));

    // 3. Extract live title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : null;

    // 4. Extract channel ID
    const channelIdMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    const channelId = channelIdMatch ? channelIdMatch[1] : null;

    // 5. Extract genuine channel profile picture (NOT the video thumbnail ytimg.com)
    const yt3Match = html.match(/https:\/\/yt3\.(?:googleusercontent|ggpht)\.com\/[a-zA-Z0-9_\-=]+/g);
    let avatar: string | null = null;
    if (yt3Match && yt3Match.length > 0) {
      // Find the highest resolution avatar or pick the first and bump to s176
      const bestMatch = yt3Match.find((u) => u.includes('=s176') || u.includes('=s900')) || yt3Match[0];
      avatar = bestMatch.replace(/=s\d+/, '=s176');
    }

    // 6. Extract viewer count if available
    const viewerMatch = html.match(/(\d[\d.,]*)\s+(?:watching|menonton)/i);
    const viewerCount = viewerMatch ? viewerMatch[1] : null;

    const result: StreamerLiveStatus = {
      handle: normalizedHandle,
      isLive: isLive && !!videoId,
      videoId: isLive ? videoId : null,
      title: isLive ? title : null,
      viewerCount,
      avatar,
      channelId,
      lastChecked: now,
    };

    // Cache result
    statusCache.set(normalizedHandle.toLowerCase(), {
      data: result,
      expiresAt: now + CACHE_TTL_MS,
    });

    return result;
  } catch (err) {
    statusCache.set(normalizedHandle.toLowerCase(), {
      data: fallbackStatus,
      expiresAt: now + 30000,
    });
    return fallbackStatus;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handlesParam = searchParams.get('handles');

  if (!handlesParam) {
    return NextResponse.json({ error: 'Missing handles parameter' }, { status: 400 });
  }

  const handles = handlesParam
    .split(',')
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  const promises = handles.map((h) => checkSingleChannel(h));
  const results = await Promise.all(promises);

  const statuses: Record<string, StreamerLiveStatus> = {};
  results.forEach((status) => {
    statuses[status.handle.toLowerCase()] = status;
  });

  return NextResponse.json({ statuses });
}
