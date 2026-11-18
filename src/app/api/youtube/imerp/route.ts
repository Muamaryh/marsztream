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
const CACHE_TTL_MS = 15 * 1000; // 15 seconds fast cache

// Strict regex: stream title MUST contain exact hashtag #imeroleplay or #imerp (case-insensitive)
const IME_HASHTAG_REGEX = /#(imeroleplay|imerp)(?![a-z0-9_])/i;

// Alias mapping to consolidate duplicate gang names into one canonical ID
const GANG_ALIASES: Record<string, string> = {
  ANAKCEOKOPAT: 'CEOKOPAT',
  CEOKOPAT: 'CEOKOPAT',
  ANAKCEOKOTAK: 'CEOKOTAK',
  CEOKOTAK: 'CEOKOTAK',
  '4BLOODS': '4BLOOD',
  '4BLOOD': '4BLOOD',
  POLISI: 'IMEPOLICE',
  POLICE: 'IMEPOLICE',
  IMEPOLICE: 'IMEPOLICE',
  IMESHERIFF: 'LSSD',
  SHERIFF: 'LSSD',
  LSSD: 'LSSD',
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
  EMSIME: 'EMS',
  IMEMEDICALCENTER: 'EMS',
  BURGENK: 'BORGEN',
  BORGEN: 'BORGEN',
  NSN969: 'NSN',
  '969GARAGE': 'NSN',
  KERTA969: 'KERTA969',
  KERTASOA969: 'KERTA969',
  NAKAMAMC: 'NAKAMA',
  NMC: 'NAKAMA',
  NAKAMA: 'NAKAMA',
  MFL: 'MAPENDOS',
  MAPENDOS: 'MAPENDOS',
  WTBOT: 'WTGG',
  WTGG: 'WTGG',
  LILIS: 'BOCILORILILIS',
  BOCILORILILIS: 'BOCILORILILIS',
  VAGABOND: 'VAGABOND',
  OLSEN: 'OLSEN',
  KZN: 'KZN',
  HIGHTABLE: 'HIGHTABLE',
  OMC: 'OMC',
};

// Known factions / gangs with friendly display names & emojis
const KNOWN_GANG_METADATA: Record<string, { name: string; icon: string }> = {
  '4BLOOD': { name: '4Blood', icon: '🩸' },
  VAGABOND: { name: 'Vagabond', icon: '⚔️' },
  CEOKOPAT: { name: 'CEO KOPAT', icon: '👑' },
  CEOKOTAK: { name: 'CEO KOTAK', icon: '📦' },
  '5TAR': { name: '5TAR', icon: '⭐' },
  KCG: { name: 'KCG', icon: '🦁' },
  KZN: { name: 'KZN', icon: '⚡' },
  OLSEN: { name: 'Olsen', icon: '🦅' },
  IMEPOLICE: { name: 'Police / PD', icon: '👮' },
  LSSD: { name: 'Sheriff / LSSD', icon: '⭐' },
  EMS: { name: 'EMS / Medis', icon: '🚑' },
  IMEDOC: { name: 'DOC / Penjara', icon: '🏢' },
  DOJ: { name: 'DOJ / Hakim', icon: '⚖️' },
  WTGG: { name: 'WTGG', icon: '🎮' },
  MAPENDOS: { name: 'Mapendos (MFL)', icon: '👺' },
  NAKAMA: { name: 'Nakama MC', icon: '🏍️' },
  BMC: { name: 'BMC', icon: '🏍️' },
  OMC: { name: 'OMC', icon: '🏍️' },
  HIGHTABLE: { name: 'High Table', icon: '🎩' },
  KERTA969: { name: 'Kerta 969', icon: '🔥' },
  SWAG: { name: 'SWAG', icon: '💎' },
  COUGANFAMS: { name: 'Cougan Fams', icon: '🐺' },
  LAWLESS: { name: 'Lawless', icon: '⚖️' },
  BFL: { name: 'BFL', icon: '🔥' },
  BORGEN: { name: 'Borgen (Burgenk)', icon: '🐺' },
  PIRATES: { name: 'Pirates', icon: '🏴‍☠️' },
  WARLOCKS: { name: 'Warlocks', icon: '🧙' },
  NORTENOS: { name: 'Nortenos', icon: '🔴' },
  SANTOS: { name: 'Santos', icon: '🌴' },
  BOA: { name: 'BOA', icon: '🐍' },
  DOBRAK: { name: 'Dobrak (DSG)', icon: '👊' },
  BOCILORILILIS: { name: 'Bocil Lilis', icon: '🌸' },
  BLACKJACK: { name: 'Blackjack', icon: '🃏' },
  OVERKILL: { name: 'Overkill', icon: '💀' },
  THELOST: { name: 'The Lost', icon: '🦅' },
  JAWA: { name: 'Jawa', icon: '🏝️' },
  HOPE: { name: 'Hope', icon: '🕊️' },
  JRZ: { name: 'JRZ', icon: '⚡' },
  RATAGANG: { name: 'Rata Gang', icon: '💥' },
  NSN: { name: 'NSN 969', icon: '🚗' },
  SHINIGAMI: { name: 'Shinigami', icon: '☠️' },
  PINKPANTHER: { name: 'Pink Panther', icon: '🐆' },
  WINDAHBASUDARA: { name: 'Windah Basudara', icon: '👑' },
};

const JUNK_TAGS = new Set([
  'IMERP',
  'IMEROLEPLAY',
  'IME',
  'IMESTRONG',
  'RP',
  'ROLEPLAY',
  'ROLEPLAYINDONESIA',
  'GTA',
  'GTAV',
  'GTA5',
  'GTA5RP',
  'GTARP',
  'GTA6',
  'GTAVI',
  'GTAONLINE',
  'FIVEM',
  'REDM',
  'LIVE',
  'LIVESTREAM',
  'STREAM',
  'STREAMING',
  'SHORTS',
  'SHORTSLIVE',
  'GAMING',
  'GAMINGLIVESTREAM',
  'INDONESIA',
  'SUBATHON',
  'MEMBERSHIP',
  'TIKTOK',
  'DISCORD',
  'DONASI',
  'SAWERIA',
  'BAGIBAGI',
  'SOCIABUZZ',
  'TAKO',
  'MOD',
  'GRAPHIC',
  'FIVEGUARD',
  'VOICE',
  'VIRAL',
  'FYP',
  'TRENDING',
  'DAILY',
  'INDOPRIDE',
  'INDOPRIDERP',
  'POLISIIDP',
  'KOTAKITARP',
  'MOTIONIME',
  'MOTIONLIFERP',
  'EXECUTIVERP',
  'PERINTISBUKANPEWARIS',
  'OMCASIK',
  'ROBRUN',
  'FREEFIRE',
  'MOBILELEGENDS',
  'MLBB',
  'APEXLEGENDS',
  'VALORANT',
  'DOTA',
  'DOTA2',
  'INVOKER',
  'CS2',
  'PUBG',
  'ROBLOX',
  'MINECRAFT',
]);

function isValidGangTag(tag: string): boolean {
  const upper = tag.toUpperCase().trim();
  if (!upper || upper.length < 2) return false;
  if (/^\d+$/.test(upper)) return false;

  if (upper !== 'IMEPOLICE' && upper !== 'IMEDOC' && upper !== 'IMESHERIFF') {
    if (upper.endsWith('RP') || upper.startsWith('RP') || upper.includes('ROLEPLAY')) {
      return false;
    }
  }

  if (JUNK_TAGS.has(upper)) return false;
  return true;
}

function hasExactWord(upperText: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Z0-9_])${escaped}([^A-Z0-9_]|$)`).test(upperText);
}

/**
 * Strict IME Roleplay Stream Validator:
 * 1. Title MUST explicitly include #imeroleplay or #imerp.
 * 2. Excludes 24/7 radio/prayer/unrelated non-GTA games where streamer left old #imerp tag in title.
 */
function isImeRPStream(title: string): boolean {
  if (!title || !IME_HASHTAG_REGEX.test(title)) {
    return false;
  }

  const lowerTitle = title.toLowerCase();

  // Guard against 24/7 loops or blatant non-GTA games unless GTA/Kota/FiveM is also mentioned
  if (
    lowerTitle.includes('radio 24/7') ||
    lowerTitle.includes('24/7 live') ||
    lowerTitle.includes('blood of jesus') ||
    lowerTitle.includes('skylinewebcams') ||
    lowerTitle.includes('cakrawalacounty')
  ) {
    return false;
  }

  const hasExplicitOtherGame = /#(dota2?|mlbb|mobilelegends|freefire|pubg|pubgm|roblox|bloxfruits?|minecraft|efootball|fc25)\b/i.test(
    title
  );
  if (hasExplicitOtherGame && !/\b(kota|gta\s*[5v]?|fivem)\b/i.test(title)) {
    return false;
  }

  return true;
}

function processVideoItem(
  v: any,
  streamMap: Map<string, ImeStream & { viewerNum?: number }>
) {
  if (!v || !v.videoId) return;

  // RULE 1: Exclude finished VODs (have lengthText) and unstarted scheduled streams (have upcomingEventData)
  if (v.lengthText || v.upcomingEventData) return;

  // RULE 2: Must have explicit LIVE_NOW indicator in badges or thumbnail overlay
  const badgesStr = JSON.stringify(v.badges || []);
  const overlayStr = JSON.stringify(v.thumbnailOverlays || []);
  const isCurrentlyLive =
    badgesStr.includes('BADGE_STYLE_TYPE_LIVE_NOW') ||
    overlayStr.includes('"style":"LIVE"');
  if (!isCurrentlyLive) return;

  const title = v.title?.runs?.map((r: any) => r.text).join('') || '';
  const channelName = v.ownerText?.runs?.[0]?.text || 'Streamer';

  // RULE 3: Strict #imeroleplay / #imerp hashtag filter on stream title
  if (!isImeRPStream(title)) return;

  const videoId = v.videoId;

  // Extract gang hashtags strictly from the stream's own title (never force search query's gangId!)
  const rawTags = (title.match(/#([a-zA-Z0-9_.-]+)/g) || []).map((t: string) =>
    t.replace('#', '').toUpperCase()
  );

  const uniqueTags = new Set<string>();

  for (const tag of rawTags) {
    const mapped = GANG_ALIASES[tag] || tag;
    if (isValidGangTag(mapped)) {
      uniqueTags.add(mapped);
    }
  }

  // Also check whole-word matches in title for known gangs if streamer wrote gang name without '#'
  const upperTitle = title.toUpperCase();
  for (const key of Object.keys(KNOWN_GANG_METADATA)) {
    if (key.length >= 3 && hasExactWord(upperTitle, key) && isValidGangTag(key)) {
      const canonicalTag = GANG_ALIASES[key] || key;
      uniqueTags.add(canonicalTag);
    }
  }
  for (const [alias, canonical] of Object.entries(GANG_ALIASES)) {
    if (alias.length >= 3 && hasExactWord(upperTitle, alias) && isValidGangTag(canonical)) {
      uniqueTags.add(canonical);
    }
  }

  // If already in map, merge any extracted gang tags
  if (streamMap.has(videoId)) {
    const existing = streamMap.get(videoId)!;
    const mergedGangs = new Set(existing.gangs.filter((g) => g !== 'CIVILIAN'));
    for (const g of uniqueTags) {
      mergedGangs.add(g);
    }
    existing.gangs = mergedGangs.size > 0 ? Array.from(mergedGangs) : ['CIVILIAN'];
    return;
  }

  const rawViewCountText =
    v.viewCountText?.runs?.map((r: any) => r.text).join('') ||
    v.shortViewCountText?.runs?.map((r: any) => r.text).join('') ||
    v.shortViewCountText?.simpleText ||
    '';

  const channelHandle =
    v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl?.replace('/', '') ||
    `@${channelName.replace(/\s+/g, '')}`;

  const rawAvatar =
    v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url ||
    null;
  const avatar = rawAvatar ? rawAvatar.replace(/=s\d+/, '=s176') : null;

  // Parse numeric viewer count for sorting
  let viewerNum = 0;
  const matchNum = rawViewCountText.replace(/[.,]/g, '').match(/(\d+)/);
  if (matchNum) viewerNum = parseInt(matchNum[1], 10);

  const finalGangs = uniqueTags.size > 0 ? Array.from(uniqueTags) : ['CIVILIAN'];

  streamMap.set(videoId, {
    id: videoId,
    videoId,
    channelName,
    channelHandle,
    avatar,
    title,
    viewers: rawViewCountText || '🔴 Live',
    viewerNum,
    isLive: true,
    gangs: finalGangs,
  });
}

// Targeted discovery queries: ALL paired with imeroleplay / imerp to maximize genuine stream coverage
// beyond YouTube's 20-item per-page search cap without pulling random unrelated streams.
const SEARCH_QUERIES: string[] = [
  // Core IME Roleplay hashtags & keywords
  '#imeroleplay',
  '#imerp',
  'imeroleplay',
  'imerp',
  '"#imeroleplay"',
  '"#imerp"',

  // Major gangs paired with #imeroleplay / #imerp for deep discovery during prime time (50-120+ live)
  '#anakceokopat #imeroleplay',
  '#anakceokopat #imerp',
  '#4blood #imeroleplay',
  '#4blood #imerp',
  '#vagabond #imeroleplay',
  '#vagabond #imerp',
  '#kzn #imeroleplay',
  '#kzn #imerp',
  '#olsen #imeroleplay',
  '#olsen #imerp',
  '#5tar #imeroleplay',
  '#kcg #imeroleplay',
  '#wtgg #imeroleplay',
  '#wtgg #imerp',
  '#mapendos #imeroleplay',
  '#mfl #imeroleplay',
  '#nakamamc #imeroleplay',
  '#awasbmcgalak #imeroleplay',
  '#dobrak #imeroleplay',
  '#burgenk #imeroleplay',
  '#lawless #imeroleplay',
  '#couganfams #imeroleplay',
  '#swag #imeroleplay',
  '#hightable #imeroleplay',
  '#imepolice #imeroleplay',
  '#imesheriff #imeroleplay',
  '#imedoc #imeroleplay',
];

async function searchYouTubeQuery(
  query: string,
  streamMap: Map<string, ImeStream & { viewerNum?: number }>,
  spParam: string = 'EgJAAQ%253D%253D'
) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=${spParam}&hl=id&gl=ID`;
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

    for (const sec of sections) {
      const items = sec.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          processVideoItem(item.videoRenderer, streamMap);
        }
      }
    }
  } catch {
    // ignore individual query network/timeout errors
  }
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const force = req.nextUrl.searchParams.get('force') === '1';

  // Return cached data if fresh and not forced
  if (!force && cachedData && cachedData.expiresAt > now) {
    return NextResponse.json(cachedData);
  }

  const streamMap = new Map<string, ImeStream & { viewerNum?: number }>();

  // Also query ViewCount+Live and UploadDate+Live on primary hashtags to catch both top & newly-started streams
  const tasks: Promise<void>[] = [
    ...SEARCH_QUERIES.map((query) => searchYouTubeQuery(query, streamMap, 'EgJAAQ%253D%253D')),
    searchYouTubeQuery('#imeroleplay', streamMap, 'CAMSBAhAAQ%3D%3D'),
    searchYouTubeQuery('#imerp', streamMap, 'CAMSBAhAAQ%3D%3D'),
    searchYouTubeQuery('#imeroleplay', streamMap, 'CAISBAhAAQ%3D%3D'),
    searchYouTubeQuery('#imerp', streamMap, 'CAISBAhAAQ%3D%3D'),
  ];

  await Promise.allSettled(tasks);

  // Convert map to array and sort strictly by viewer count descending (Top active streamers first)
  const streams = Array.from(streamMap.values())
    .sort((a, b) => (b.viewerNum || 0) - (a.viewerNum || 0))
    .map(({ viewerNum, ...rest }) => rest);

  // Count gangs / factions (deduplicated per stream)
  const gangCountMap = new Map<string, number>();

  for (const s of streams) {
    if (Array.isArray(s.gangs)) {
      for (const g of s.gangs) {
        gangCountMap.set(g, (gangCountMap.get(g) || 0) + 1);
      }
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

  // Add known factions with streamer count > 0
  const sortedKnownGangs = Object.entries(KNOWN_GANG_METADATA)
    .map(([id, meta]) => ({
      id,
      name: meta.name,
      icon: meta.icon,
      count: gangCountMap.get(id) || 0,
    }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);

  gangs.push(...sortedKnownGangs);

  // Add remaining active gangs not in known metadata (sorted by count descending)
  const dynamicGangs: ImeGang[] = [];
  for (const [gangId, count] of gangCountMap.entries()) {
    if (
      gangId !== 'CIVILIAN' &&
      !KNOWN_GANG_METADATA[gangId] &&
      !gangs.some((g) => g.id === gangId)
    ) {
      dynamicGangs.push({
        id: gangId,
        name: gangId,
        count,
        icon: '⚔️',
      });
    }
  }
  dynamicGangs.sort((a, b) => b.count - a.count);
  gangs.push(...dynamicGangs);

  // Add Civilian / Other category at the end if present
  const civilianCount = gangCountMap.get('CIVILIAN') || 0;
  if (civilianCount > 0) {
    gangs.push({
      id: 'CIVILIAN',
      name: 'Civilian / Lainnya',
      count: civilianCount,
      icon: '👤',
    });
  }

  const result: CacheData = {
    streams,
    gangs,
    totalLive: streams.length,
    expiresAt: now + CACHE_TTL_MS,
  };

  cachedData = result;
  return NextResponse.json(result);
}
