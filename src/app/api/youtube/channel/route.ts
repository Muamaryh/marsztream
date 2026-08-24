import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');

  if (!input) {
    return NextResponse.json({ error: 'Input tidak boleh kosong' }, { status: 400 });
  }

  let cleanInput = input.trim();

  // Extract handle from various URL patterns
  // Pattern 1: https://www.youtube.com/@handle/live or https://youtube.com/@handle
  const handleMatch = cleanInput.match(/@([a-zA-Z0-9_.-]+)/);
  let handle = '';

  if (handleMatch) {
    handle = `@${handleMatch[1]}`;
  } else if (cleanInput.startsWith('@')) {
    handle = cleanInput;
  } else if (!cleanInput.includes('/')) {
    handle = `@${cleanInput}`;
  } else {
    // If user passed a general link, extract pathname
    try {
      const urlObj = new URL(cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const possibleHandle = segments.find(s => s.startsWith('@'));
      if (possibleHandle) {
        handle = possibleHandle;
      } else if (segments.length > 0) {
        handle = `@${segments[0]}`;
      }
    } catch {
      handle = `@${cleanInput}`;
    }
  }

  if (!handle) {
    return NextResponse.json({ error: 'Handle YouTube tidak valid' }, { status: 400 });
  }

  try {
    const channelUrl = `https://www.youtube.com/${handle}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(channelUrl, {
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

    // 1. Extract official Channel Name
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let name = ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : handle.replace('@', ''));

    // 2. Extract official Channel Avatar
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
    const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
    const avatar = ogImageMatch ? ogImageMatch[1] : (avatarMatch ? avatarMatch[1] : null);

    const id = handle.replace('@', '').toLowerCase();

    return NextResponse.json({
      id,
      name,
      handle,
      avatar,
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      id: handle.replace('@', '').toLowerCase(),
      name: handle.replace('@', ''),
      handle,
      avatar: null,
      success: true,
    });
  }
}
