import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_DIR = path.join(process.cwd(), '.cache', 'api');

// Ensure cache dir exists on server start
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore in read-only / serverless environments
}

function getCacheFilePath(key: string): string {
  const hash = crypto.createHash('md5').update(key).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

export function getFromCache<T>(key: string): T | null {
  const now = Date.now();

  // 1. Check memory cache first
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      return memEntry.data;
    } else {
      memoryCache.delete(key);
    }
  }

  // 2. Check disk cache
  try {
    const filePath = getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const diskEntry: CacheEntry<T> = JSON.parse(content);
      if (diskEntry.expiresAt > now) {
        // Restore to memory cache for subsequent fast lookups
        memoryCache.set(key, diskEntry);
        return diskEntry.data;
      } else {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    // Disk cache read failure fallback
  }

  return null;
}

export function setInCache<T>(key: string, data: T, ttlSeconds: number = 3600): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    expiresAt: now + ttlSeconds * 1000,
    createdAt: now,
  };

  // 1. Write to memory cache
  memoryCache.set(key, entry);

  // Evict memory cache if it gets too large (> 1000 items)
  if (memoryCache.size > 1000) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }

  // 2. Persist to disk cache
  try {
    const filePath = getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
  } catch (err) {
    // Ignore disk write failure
  }
}

export function deleteFromCache(key: string): void {
  memoryCache.delete(key);
  try {
    const filePath = getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
}

export function getCacheStats() {
  return {
    memoryEntries: memoryCache.size,
    cacheDir: CACHE_DIR,
  };
}
