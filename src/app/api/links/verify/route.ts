import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  valid: boolean;
  checkedAt: number;
}

const CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours
const MAX_URLS = 50;
const HEAD_TIMEOUT = 5000; // 5 seconds

// Module-level in-memory cache (resets on cold start)
const cache = new Map<string, CacheEntry>();

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.checkedAt < CACHE_TTL;
}

async function checkUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEAD_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Missing or empty urls array' }, { status: 400 });
    }

    if (urls.length > MAX_URLS) {
      return NextResponse.json({ error: `Maximum ${MAX_URLS} URLs per request` }, { status: 400 });
    }

    const results: Record<string, 'valid' | 'invalid'> = {};
    const uncachedUrls: string[] = [];

    // Check cache first
    for (const url of urls) {
      if (typeof url !== 'string') continue;
      const cached = cache.get(url);
      if (cached && isCacheValid(cached)) {
        results[url] = cached.valid ? 'valid' : 'invalid';
      } else {
        uncachedUrls.push(url);
      }
    }

    // Check uncached URLs in parallel
    if (uncachedUrls.length > 0) {
      const checks = await Promise.allSettled(
        uncachedUrls.map(async (url) => {
          const valid = await checkUrl(url);
          return { url, valid };
        })
      );

      for (const result of checks) {
        if (result.status === 'fulfilled') {
          const { url, valid } = result.value;
          cache.set(url, { valid, checkedAt: Date.now() });
          results[url] = valid ? 'valid' : 'invalid';
        } else {
          // If the promise itself rejected (shouldn't happen with our try/catch, but defensive)
          // We can't easily recover the URL here, so skip
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Link verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
