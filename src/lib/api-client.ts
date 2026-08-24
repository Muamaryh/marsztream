import { getFromCache, setInCache } from './cache';
import { singleFlight } from './singleflight';
import { upstreamRateLimiter } from './rate-limiter';

const BASE_URL = 'https://api.sansekai.my.id/api';

export interface FetchOptions {
  ttlSeconds?: number;
  skipCache?: boolean;
}

export async function fetchSansekaiApi<T = any>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined | null> = {},
  options: FetchOptions = {}
): Promise<T> {
  const { ttlSeconds = 7200, skipCache = false } = options; // Default 2 hours cache

  // Normalize path & query params
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      queryParams.set(key, String(val));
    }
  });

  const queryString = queryParams.toString();
  const cacheKey = `sansekai:${cleanEndpoint}${queryString ? '?' + queryString : ''}`;

  // 1. Check multi-tier cache
  if (!skipCache) {
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 2. SingleFlight Deduplication
  return singleFlight.do(cacheKey, async () => {
    // Re-check cache inside singleflight lock (in case a concurrent request just resolved)
    if (!skipCache) {
      const cached = getFromCache<T>(cacheKey);
      if (cached) return cached;
    }

    // 3. Rate-limited execution
    return upstreamRateLimiter.enqueue(async () => {
      const fullUrl = `${BASE_URL}${cleanEndpoint}${queryString ? '?' + queryString : ''}`;
      
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const res = await fetch(fullUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
            },
          });

          // Check if rate limited by remote server
          if (res.status === 429) {
            console.warn(`[Upstream 429] Rate limit hit for ${fullUrl}. Waiting before retry (${attempts}/${maxAttempts})...`);
            await new Promise((r) => setTimeout(r, 60000)); // Wait 60s
            continue;
          }

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Upstream error (${res.status}): ${errorText || res.statusText}`);
          }

          const data = await res.json();

          // Check if body contains rate limit error message
          if (data && typeof data === 'object' && data.error === 'Too Many Requests') {
            console.warn(`[Upstream 429 Body] Rate limit in payload for ${fullUrl}. Waiting...`);
            await new Promise((r) => setTimeout(r, 60000));
            continue;
          }

          // Successfully retrieved data -> cache it
          setInCache<T>(cacheKey, data, ttlSeconds);
          return data;
        } catch (err: any) {
          if (attempts >= maxAttempts) {
            throw err;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }

      throw new Error(`Failed to fetch from ${fullUrl} after ${maxAttempts} attempts.`);
    });
  });
}
