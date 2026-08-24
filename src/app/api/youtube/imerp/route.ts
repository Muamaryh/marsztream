import { NextRequest, NextResponse } from 'next/server';
import { ImeStream, ImeGang } from '@/types/imerp';

export const dynamic = 'force-dynamic';

interface CacheData {
  streams: ImeStream[];
  gangs: ImeGang[];
  totalLive: number;
  expiresAt: number;
}

let cachedData: CacheData | null = null;
const CACHE_TTL_MS = 15 * 1000; // 15 seconds fast sync

// Alias mapping to consolidate duplicate gang names into one canonical ID
const GANG_ALIASES: Record<string, string> = {
  ANAKCEOKOPAT: 'CEOKOPAT',
  CEOKOPAT: 'CEOKOPAT',
  ANAKCEOKOTAK: 'CEOKOTAK',
  '4BLOODS': '4BLOOD',
  '4BLOOD': '4BLOOD',
  POLISI: 'IMEPOLICE',
  POLICE: 'IMEPOLICE',
  IMEPOLICE: 'IMEPOLICE',
  DSG: 'DOBRAK',
  DOBRAKSOLID: 'DOBRAK',
  DOBRAKGANG: 'DOBRAK',
  DOBRAK: 'DOBRAK',
  AWASBMCGALAK: 'BMC',
  BMC: 'BMC',
  HOPEINDONESIA: 'HOPE',
  HOPESOLID: 'HOPE',
  HOPE: 'HOPE',
  DOC: 'IMEDOC',
  IMEDOC: 'IMEDOC',
  BURGENK: 'BORGEN',
  BORGEN: 'BORGEN',
  NSN969: 'NSN',
  '969GARAGE': 'NSN',
  NAKAMAMC: 'NAKAMA',
  NMC: 'NAKAMA',
  NAKAMA: 'NAKAMA',
  LILIS: 'BOCILORILILIS',
  BOCILORILILIS: 'BOCILORILILIS',
  VAGABOND: 'VAGABOND',
  OLSEN: 'OLSEN',
  KZN: 'KZN',
};

// Known factions / gangs with friendly display names & emojis
const KNOWN_GANG_METADATA: Record<string, { name: string; icon: string }> = {
  VAGABOND: { name: 'Vagabond', icon: '⚔️' },
  KZN: { name: 'KZN', icon: '⚡' },
  '4BLOOD': { name: '4Blood', icon: '🩸' },
  OLSEN: { name: 'Olsen', icon: '🦅' },
  IMEPOLICE: { name: 'Police / PD', icon: '👮' },
  LSSD: { name: 'Sheriff / LSSD', icon: '⭐' },
  EMS: { name: 'EMS / Medis', icon: '🚑' },
  IMEDOC: { name: 'DOC / Penjara', icon: '🏢' },
  DOJ: { name: 'DOJ / Hakim', icon: '⚖️' },
  BORGEN: { name: 'Borgen (Burgenk)', icon: '🐺' },
  BURGENK: { name: 'Borgen (Burgenk)', icon: '🐺' },
  PIRATES: { name: 'Pirates', icon: '🏴‍☠️' },
  WARLOCKS: { name: 'Warlocks', icon: '🧙' },
  NORTENOS: { name: 'Nortenos', icon: '🔴' },
  SANTOS: { name: 'Santos', icon: '🌴' },
  BOA: { name: 'BOA', icon: '🐍' },
  DOBRAK: { name: 'Dobrak (DSG)', icon: '👊' },
  BMC: { name: 'BMC', icon: '🏍️' },
  CEOKOPAT: { name: 'CEO KOPAT', icon: '👑' },
  CEOKOTAK: { name: 'CEO KOTAK', icon: '📦' },
  BOCILORILILIS: { name: 'Bocil Lilis', icon: '🌸' },
  BLACKJACK: { name: 'Blackjack', icon: '🃏' },
  OVERKILL: { name: 'Overkill', icon: '💀' },
  THELOST: { name: 'The Lost', icon: '🦅' },
  JAWA: { name: 'Jawa', icon: '🏝️' },
  '5TAR': { name: '5TAR', icon: '⭐' },
  SWAG: { name: 'SWAG', icon: '💎' },
  HOPE: { name: 'Hope', icon: '🕊️' },
  BFL: { name: 'BFL', icon: '🔥' },
  MAPENDOS: { name: 'Mapendos', icon: '👺' },
  NAKAMA: { name: 'Nakama MC', icon: '🏍️' },
  JRZ: { name: 'JRZ', icon: '⚡' },
  LAWLESS: { name: 'Lawless', icon: '⚖️' },
  RATAGANG: { name: 'Rata Gang', icon: '💥' },
  WTGG: { name: 'WTGG', icon: '🎮' },
  COUGANFAMS: { name: 'Cougan Fams', icon: '🐺' },
  NSN: { name: 'NSN 969', icon: '🚗' },
  SHINIGAMI: { name: 'Shinigami', icon: '☠️' },
  PINKPANTHER: { name: 'Pink Panther', icon: '🐆' },
  WINDAHBASUDARA: { name: 'Windah Basudara', icon: '👑' },
};

function isValidGangTag(tag: string): boolean {
  const upper = tag.toUpperCase().trim();
  if (!upper || upper.length < 2) return false;
  if (/^\d+$/.test(upper)) return false;

  // Exclude other RP servers and generic words ending or starting with RP / ROLEPLAY
  if (upper !== 'IMEPOLICE' && upper !== 'IMEDOC') {
    if (upper.endsWith('RP') || upper.startsWith('RP') || upper.includes('ROLEPLAY')) {
      return false;
    }
  }

  const junkWords = [
    'IMERP',
    'IMEROLEPLAY',
    'IME',
    'RP',
    'ROLEPLAY',
    'GTA',
    'GTAV',
    'GTA5',
    'FIVEM',
    'LIVE',
    'LIVESTREAM',
    'STREAM',
    'STREAMING',
    'INDONESIA',
    'YOUTUBE',
    'GAMING',
    'GAME',
    'PC',
    'ROBLOX',
    'RF',
    'RFONLINE',
    'RFONLINENEXT',
    'SUBATHON',
    'MEMBERSHIP',
    'TIKTOK',
    'DISCORD',
    'DONASI',
    'SAWERIA',
    'MOD',
    'GRAPHIC',
    'FIVEGUARD',
    'VOICE',
    'VIRAL',
    'FYP',
    'TRENDING',
    'INDOPRIDE',
    'MOTIONIME',
    'PERINTISBUKANPEWARIS',
    'OMCASIK',
    'FREEFIRE',
    'MOBILELEGENDS',
    'MLBB',
    'APEXLEGENDS',
    'VALORANT',
  ];

  if (junkWords.includes(upper)) return false;
  return true;
}

function processVideoItem(v: any, streamMap: Map<string, ImeStream>) {
  if (!v || !v.videoId || streamMap.has(v.videoId)) return;

  const title = v.title?.runs?.map((r: any) => r.text).join('') || '';
  const lowerTitle = title.toLowerCase();

  // Strict check: must be IME Roleplay stream
  const isImeRP =
    lowerTitle.includes('imerp') ||
    lowerTitle.includes('imeroleplay') ||
    lowerTitle.includes('ime rp') ||
    lowerTitle.includes('ime roleplay') ||
    lowerTitle.includes('#ime') ||
    lowerTitle.includes('vagabond') ||
    lowerTitle.includes('burgenk') ||
    lowerTitle.includes('borgen') ||
    lowerTitle.includes('4blood') ||
    lowerTitle.includes('olsen') ||
    lowerTitle.includes('kzn');

  if (!isImeRP) return;

  const videoId = v.videoId;
  const channelName = v.ownerText?.runs?.[0]?.text || 'Streamer';
  const channelHandle =
    v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl?.replace('/', '') ||
    `@${channelName.replace(/\s+/g, '')}`;

  const rawAvatar =
    v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url ||
    null;
  const avatar = rawAvatar ? rawAvatar.replace(/=s\d+/, '=s176') : null;

  const viewers =
    v.shortViewCountText?.runs?.map((r: any) => r.text).join('') ||
    v.viewCountText?.runs?.map((r: any) => r.text).join('') ||
    '';

  // 1. Extract hashtags from title
  const rawTags = (title.match(/#([a-zA-Z0-9_.-]+)/g) || []).map((t: string) =>
    t.replace('#', '').toUpperCase()
  );

  // 2. Deduplicate and consolidate aliases per streamer
  const uniqueTags = new Set<string>();
  for (const tag of rawTags) {
    if (isValidGangTag(tag)) {
      const canonicalTag = GANG_ALIASES[tag] || tag;
      uniqueTags.add(canonicalTag);
    }
  }

  // 3. Check for known faction names in title
  const upperTitle = title.toUpperCase();
  for (const key of Object.keys(KNOWN_GANG_METADATA)) {
    if (upperTitle.includes(key) && isValidGangTag(key)) {
      const canonicalTag = GANG_ALIASES[key] || key;
      uniqueTags.add(canonicalTag);
    }
  }

  const finalGangs = uniqueTags.size > 0 ? Array.from(uniqueTags) : ['CIVILIAN'];

  streamMap.set(videoId, {
    id: videoId,
    videoId,
    channelName,
    channelHandle,
    avatar,
    title,
    viewers,
    isLive: true,
    gangs: finalGangs,
  });
}

async function searchYouTubeQuery(query: string, streamMap: Map<string, ImeStream>) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgJAAQ%253D%253D`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    clearTimeout(timeoutId);

    const html = await res.text();
    const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!initialDataMatch) return;

    const json = JSON.parse(initialDataMatch[1]);
    const sections =
      json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    let continuationToken: string | null = null;

    for (const sec of sections) {
      if (sec.continuationItemRenderer) {
        continuationToken =
          sec.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
      }

      const items = sec.itemSectionRenderer?.contents || [];
      for (const item of items) {
        processVideoItem(item.videoRenderer, streamMap);
      }
    }

    // Fetch Page 2 if continuation token is available
    if (continuationToken) {
      try {
        const apiRes = await fetch(`https://www.youtube.com/youtubei/v1/search?prettyPrint=false`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB',
                clientVersion: '2.20240315.00.00',
                hl: 'id',
                gl: 'ID',
              },
            },
            continuation: continuationToken,
          }),
        });
        const data = await apiRes.json();
        const page2Items =
          data.onResponseReceivedCommands?.[0]?.appendContinuationItemsAction?.continuationItems || [];

        for (const item of page2Items) {
          const items = item.itemSectionRenderer?.contents || [];
          for (const it of items) {
            processVideoItem(it.videoRenderer, streamMap);
          }
        }
      } catch (err) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }
}

async function checkChannelDirect(handle: string, streamMap: Map<string, ImeStream>) {
  try {
    const url = `https://www.youtube.com/${handle}/live`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    const html = await res.text();
    const vMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = vMatch ? vMatch[1] : null;
    if (!videoId || streamMap.has(videoId)) return;

    // Fetch video page for verification
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    const watchHtml = await watchRes.text();
    const isLive =
      watchHtml.includes('"isLive":true') ||
      watchHtml.includes('"isLiveContent":true') ||
      watchHtml.includes('"style":"LIVE"');

    if (!isLive) return;

    const titleMatch = watchHtml.match(/<title>(.*?)<\/title>/);
    const rawTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : '';

    const lowerTitle = rawTitle.toLowerCase();
    const isImeRP =
      lowerTitle.includes('imerp') ||
      lowerTitle.includes('imeroleplay') ||
      lowerTitle.includes('ime rp') ||
      lowerTitle.includes('ime roleplay') ||
      lowerTitle.includes('#ime') ||
      lowerTitle.includes('vagabond') ||
      lowerTitle.includes('burgenk') ||
      lowerTitle.includes('borgen') ||
      lowerTitle.includes('4blood') ||
      lowerTitle.includes('olsen') ||
      lowerTitle.includes('kzn');

    if (!isImeRP) return;

    const channelMatch = watchHtml.match(/"author":"(.*?)"/);
    const channelName = channelMatch ? channelMatch[1] : handle.replace('@', '');

    const rawTags = (rawTitle.match(/#([a-zA-Z0-9_.-]+)/g) || []).map((t: string) =>
      t.replace('#', '').toUpperCase()
    );

    const uniqueTags = new Set<string>();
    for (const tag of rawTags) {
      if (isValidGangTag(tag)) {
        const canonicalTag = GANG_ALIASES[tag] || tag;
        uniqueTags.add(canonicalTag);
      }
    }

    const upperTitle = rawTitle.toUpperCase();
    for (const key of Object.keys(KNOWN_GANG_METADATA)) {
      if (upperTitle.includes(key) && isValidGangTag(key)) {
        const canonicalTag = GANG_ALIASES[key] || key;
        uniqueTags.add(canonicalTag);
      }
    }

    const finalGangs = uniqueTags.size > 0 ? Array.from(uniqueTags) : ['CIVILIAN'];

    streamMap.set(videoId, {
      id: videoId,
      videoId,
      channelName,
      channelHandle: handle,
      avatar: null,
      title: rawTitle,
      viewers: '',
      isLive: true,
      gangs: finalGangs,
    });
  } catch (e) {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const force = req.nextUrl.searchParams.get('force') === '1';

  // Return cached data if fresh and not forced
  if (!force && cachedData && cachedData.expiresAt > now) {
    return NextResponse.json(cachedData);
  }

  const streamMap = new Map<string, ImeStream>();

  const generalQueries = [
    'imeroleplay',
    '#imeroleplay',
    'imerp',
    '#imerp',
    'ime roleplay',
    'ime rp',
    'gta imerp',
    'gta ime roleplay',
    'fivem imerp',
    'fivem imeroleplay',
    'imeroleplay live',
    'imerp live',
    'gta 5 imerp',
  ];

  const gangQueries = [
    'vagabond',
    '#vagabond',
    'kzn',
    '#kzn',
    '4blood',
    '#4blood',
    '4blood live',
    '#4blood live',
    'persidangan 4blood',
    'persidangan imeroleplay',
    'olsen',
    '#olsen',
    'burgenk',
    '#burgenk',
    'borgen',
    '#borgen',
    'dobrak',
    '#dobrak',
    'dsg',
    '#dsg',
    'ceokopat',
    '#ceokopat',
    'anakceokopat',
    '#anakceokopat',
    'nakama',
    '#nakama',
    '5tar',
    '#5tar',
    'swag',
    '#swag',
    'jawa',
    '#jawa',
    'mapendos',
    '#mapendos',
    'bfl',
    '#bfl',
    'warlocks',
    '#warlocks',
    'pirates',
    '#pirates',
    'imepolice',
    '#imepolice',
    'bmc',
    '#bmc',
    'boa',
    '#boa',
    'shinigami',
    '#shinigami',
    'bocilorililis',
    '#bocilorililis',
  ];

  const prominentChannels = [
    '@NAHMIER',
    '@TheMoiLee',
    '@oxidstudios',
    '@DoniMulyadi',
    '@Rifzasanjani',
    '@joo-t5e',
    '@WindahBasudara',
    '@brandochillgames',
    '@putrirp',
    '@Miselulaby',
  ];

  const allQueries = [...generalQueries, ...gangQueries];

  await Promise.allSettled([
    ...allQueries.map((q) => searchYouTubeQuery(q, streamMap)),
    ...prominentChannels.map((handle) => checkChannelDirect(handle, streamMap)),
  ]);

  const streams = Array.from(streamMap.values());

  // Count gangs / factions (deduplicated per stream)
  const gangCountMap = new Map<string, number>();

  for (const s of streams) {
    for (const g of s.gangs) {
      gangCountMap.set(g, (gangCountMap.get(g) || 0) + 1);
    }
  }

  // Build sorted gang categories
  const gangs: ImeGang[] = [
    {
      id: 'ALL',
      name: 'Semua Stream',
      count: streams.length,
      icon: '🔥',
    },
  ];

  // Sort gangs by count descending
  const sortedGangEntries = Array.from(gangCountMap.entries()).sort((a, b) => b[1] - a[1]);

  for (const [gangId, count] of sortedGangEntries) {
    const meta = KNOWN_GANG_METADATA[gangId];
    const name = meta ? meta.name : gangId === 'CIVILIAN' ? 'Civilian / Lainnya' : gangId;
    const icon = meta ? meta.icon : '🎮';

    gangs.push({
      id: gangId,
      name,
      count,
      icon,
    });
  }

  cachedData = {
    streams,
    gangs,
    totalLive: streams.length,
    expiresAt: now + CACHE_TTL_MS,
  };

  return NextResponse.json(cachedData);
}
