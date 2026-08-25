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
  CEOKOPAT: { name: 'CEO KOPAT', icon: '👑' },
  CEOKOTAK: { name: 'CEO KOTAK', icon: '📦' },
  '5TAR': { name: '5TAR', icon: '⭐' },
  KCG: { name: 'KCG', icon: '🦁' },
  VAGABOND: { name: 'Vagabond', icon: '⚔️' },
  KZN: { name: 'KZN', icon: '⚡' },
  '4BLOOD': { name: '4Blood', icon: '🩸' },
  OLSEN: { name: 'Olsen', icon: '🦅' },
  IMEPOLICE: { name: 'Police / PD', icon: '👮' },
  LSSD: { name: 'Sheriff / LSSD', icon: '⭐' },
  EMS: { name: 'EMS / Medis', icon: '🚑' },
  IMEDOC: { name: 'DOC / Penjara', icon: '🏢' },
  DOJ: { name: 'DOJ / Hakim', icon: '⚖️' },
  SWAG: { name: 'SWAG', icon: '💎' },
  COUGANFAMS: { name: 'Cougan Fams', icon: '🐺' },
  LAWLESS: { name: 'Lawless', icon: '⚖️' },
  BFL: { name: 'BFL', icon: '🔥' },
  MAPENDOS: { name: 'Mapendos', icon: '👺' },
  BORGEN: { name: 'Borgen (Burgenk)', icon: '🐺' },
  BURGENK: { name: 'Borgen (Burgenk)', icon: '🐺' },
  PIRATES: { name: 'Pirates', icon: '🏴‍☠️' },
  WARLOCKS: { name: 'Warlocks', icon: '🧙' },
  NORTENOS: { name: 'Nortenos', icon: '🔴' },
  SANTOS: { name: 'Santos', icon: '🌴' },
  BOA: { name: 'BOA', icon: '🐍' },
  DOBRAK: { name: 'Dobrak (DSG)', icon: '👊' },
  BMC: { name: 'BMC', icon: '🏍️' },
  BOCILORILILIS: { name: 'Bocil Lilis', icon: '🌸' },
  BLACKJACK: { name: 'Blackjack', icon: '🃏' },
  OVERKILL: { name: 'Overkill', icon: '💀' },
  THELOST: { name: 'The Lost', icon: '🦅' },
  JAWA: { name: 'Jawa', icon: '🏝️' },
  HOPE: { name: 'Hope', icon: '🕊️' },
  NAKAMA: { name: 'Nakama MC', icon: '🏍️' },
  JRZ: { name: 'JRZ', icon: '⚡' },
  RATAGANG: { name: 'Rata Gang', icon: '💥' },
  WTGG: { name: 'WTGG', icon: '🎮' },
  NSN: { name: 'NSN 969', icon: '🚗' },
  SHINIGAMI: { name: 'Shinigami', icon: '☠️' },
  PINKPANTHER: { name: 'Pink Panther', icon: '🐆' },
  WINDAHBASUDARA: { name: 'Windah Basudara', icon: '👑' },
};

function isValidGangTag(tag: string): boolean {
  const upper = tag.toUpperCase().trim();
  if (!upper || upper.length < 2) return false;
  if (/^\d+$/.test(upper)) return false;

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

function isImeRPStream(title: string, channelName: string): boolean {
  const lower = `${title} ${channelName}`.toLowerCase();

  // Strict Exclusion for unrelated content
  if (
    lower.includes('alan becker') ||
    lower.includes('adventure time') ||
    lower.includes('warner bros') ||
    lower.includes('skylinewebcams') ||
    lower.includes('webcam') ||
    lower.includes('pubg') ||
    lower.includes('playerunknown') ||
    lower.includes('blox fruit') ||
    lower.includes('roblox') ||
    lower.includes('skibidi') ||
    lower.includes('brainrot') ||
    lower.includes('blood of jesus') ||
    lower.includes('prayer') ||
    lower.includes('back 4 blood') ||
    lower.includes('cakrawala') ||
    lower.includes('free fire') ||
    lower.includes('mobile legends') ||
    lower.includes('mlbb') ||
    lower.includes('radio 24/7') ||
    lower.includes('relaxing') ||
    lower.includes('crypto') ||
    lower.includes('asmr') ||
    lower.includes('gravity falls')
  ) {
    return false;
  }

  return (
    lower.includes('imeroleplay') ||
    lower.includes('imerp') ||
    lower.includes('ime rp') ||
    lower.includes('ime roleplay') ||
    lower.includes('#ime') ||
    lower.includes('ime siti') ||
    lower.includes('ime city') ||
    lower.includes('ime server') ||
    lower.includes('vagabond') ||
    lower.includes('4blood') ||
    lower.includes('olsen') ||
    lower.includes('kzn') ||
    lower.includes('ceokopat') ||
    lower.includes('anakceokopat') ||
    lower.includes('ceokotak') ||
    lower.includes('anakceokotak') ||
    lower.includes('burgenk') ||
    lower.includes('borgen') ||
    lower.includes('mapendos') ||
    lower.includes('bfl') ||
    lower.includes('5tar') ||
    lower.includes('kcg') ||
    lower.includes('jawa') ||
    lower.includes('nakama') ||
    lower.includes('dobrak') ||
    lower.includes('swag') ||
    lower.includes('couganfams') ||
    lower.includes('lawless') ||
    lower.includes('shinigami') ||
    lower.includes('imepolice') ||
    lower.includes('imedoc') ||
    lower.includes('emsime') ||
    lower.includes('imemedicalcenter')
  );
}

function processVideoItem(
  v: any,
  streamMap: Map<string, ImeStream & { viewerNum?: number }>,
  associatedGang?: string
) {
  if (!v || !v.videoId) return;

  // RULE 1: If lengthText exists (e.g. "4:23:48" or "1:15:20"), it is a FINISHED/RECORDED VOD! DISCARD!
  if (v.lengthText) return;

  // RULE 2: Must have explicit BADGE_STYLE_TYPE_LIVE_NOW in badges
  const badgesStr = JSON.stringify(v.badges || []);
  if (!badgesStr.includes('BADGE_STYLE_TYPE_LIVE_NOW')) return;

  const title = v.title?.runs?.map((r: any) => r.text).join('') || '';
  const channelName = v.ownerText?.runs?.[0]?.text || 'Streamer';

  // RULE 3: Strict IME Roleplay filter
  if (!isImeRPStream(title, channelName) && !associatedGang) return;

  const videoId = v.videoId;

  // 1. Extract hashtags & tags
  const rawTags = (title.match(/#([a-zA-Z0-9_.-]+)/g) || []).map((t: string) =>
    t.replace('#', '').toUpperCase()
  );

  const uniqueTags = new Set<string>();
  if (associatedGang && isValidGangTag(associatedGang)) {
    const canonical = GANG_ALIASES[associatedGang] || associatedGang;
    uniqueTags.add(canonical);
  }

  for (const tag of rawTags) {
    if (isValidGangTag(tag)) {
      const canonicalTag = GANG_ALIASES[tag] || tag;
      uniqueTags.add(canonicalTag);
    }
  }

  const upperTitle = title.toUpperCase();
  for (const key of Object.keys(KNOWN_GANG_METADATA)) {
    if (upperTitle.includes(key) && isValidGangTag(key)) {
      const canonicalTag = GANG_ALIASES[key] || key;
      uniqueTags.add(canonicalTag);
    }
  }

  // If already in map, merge the new gang tags so gang filters work seamlessly
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
  const matchNum = rawViewCountText.replace(/\./g, '').match(/(\d+)/);
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

const GANG_SEARCH_QUERIES: Array<{ query: string; gangId?: string }> = [
  // General IME Roleplay queries
  { query: 'imeroleplay' },
  { query: '#imeroleplay' },
  { query: 'imerp' },
  { query: '#imerp' },
  { query: 'ime roleplay' },
  { query: 'gta imerp' },

  // 4Blood
  { query: '4blood imeroleplay', gangId: '4BLOOD' },
  { query: '4blood imerp', gangId: '4BLOOD' },
  { query: '#4blood', gangId: '4BLOOD' },
  { query: '#4bloods', gangId: '4BLOOD' },
  { query: '4blood', gangId: '4BLOOD' },

  // Vagabond
  { query: 'vagabond imeroleplay', gangId: 'VAGABOND' },
  { query: 'vagabond imerp', gangId: 'VAGABOND' },
  { query: '#vagabond', gangId: 'VAGABOND' },

  // KZN
  { query: 'kzn imeroleplay', gangId: 'KZN' },
  { query: 'kzn imerp', gangId: 'KZN' },
  { query: '#kzn', gangId: 'KZN' },

  // Olsen
  { query: 'olsen imeroleplay', gangId: 'OLSEN' },
  { query: 'olsen imerp', gangId: 'OLSEN' },
  { query: '#olsen', gangId: 'OLSEN' },

  // CEO KOPAT & KOTAK
  { query: 'ceokopat imeroleplay', gangId: 'CEOKOPAT' },
  { query: '#ceokopat', gangId: 'CEOKOPAT' },
  { query: '#anakceokopat', gangId: 'CEOKOPAT' },
  { query: 'ceokotak imeroleplay', gangId: 'CEOKOTAK' },
  { query: '#ceokotak', gangId: 'CEOKOTAK' },

  // 5TAR & KCG
  { query: '5tar imeroleplay', gangId: '5TAR' },
  { query: '5tar imerp', gangId: '5TAR' },
  { query: '#5tar', gangId: '5TAR' },
  { query: '#kcg', gangId: 'KCG' },

  // BFL & Mapendos
  { query: 'bfl imeroleplay', gangId: 'BFL' },
  { query: '#bfl', gangId: 'BFL' },
  { query: 'mapendos imeroleplay', gangId: 'MAPENDOS' },
  { query: '#mapendos', gangId: 'MAPENDOS' },

  // Nakama & Dobrak
  { query: 'nakama imeroleplay', gangId: 'NAKAMA' },
  { query: '#nakamamc', gangId: 'NAKAMA' },
  { query: 'dobrak imeroleplay', gangId: 'DOBRAK' },
  { query: '#dobrakgang', gangId: 'DOBRAK' },

  // SWAG & Cougan Fams & Lawless
  { query: 'swag imeroleplay', gangId: 'SWAG' },
  { query: '#swag', gangId: 'SWAG' },
  { query: '#couganfams', gangId: 'COUGANFAMS' },
  { query: 'lawless imeroleplay', gangId: 'LAWLESS' },
  { query: '#lawless', gangId: 'LAWLESS' },

  // Burgenk
  { query: 'burgenk imeroleplay', gangId: 'BORGEN' },
  { query: '#burgenk', gangId: 'BORGEN' },

  // Police & Medical
  { query: 'imepolice imeroleplay', gangId: 'IMEPOLICE' },
  { query: '#imepolice', gangId: 'IMEPOLICE' },
  { query: '#imedoc', gangId: 'IMEDOC' },
];

async function searchYouTubeQuery(
  query: string,
  streamMap: Map<string, ImeStream & { viewerNum?: number }>,
  gangId?: string
) {
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
        'Cookie': 'SOCS=CAESEwgDEgk2ODEwNTk2NTQaAmVuIAEaBgiA_LyaBg; PREF=hl=id&gl=ID;',
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
        processVideoItem(item.videoRenderer, streamMap, gangId);
      }
    }
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

  const streamMap = new Map<string, ImeStream & { viewerNum?: number }>();

  await Promise.allSettled(
    GANG_SEARCH_QUERIES.map(({ query, gangId }) =>
      searchYouTubeQuery(query, streamMap, gangId)
    )
  );

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

  // Add remaining active gangs not in known metadata
  for (const [gangId, count] of gangCountMap.entries()) {
    if (
      gangId !== 'CIVILIAN' &&
      !KNOWN_GANG_METADATA[gangId] &&
      !gangs.some((g) => g.id === gangId)
    ) {
      gangs.push({
        id: gangId,
        name: gangId,
        count,
        icon: '⚔️',
      });
    }
  }

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
