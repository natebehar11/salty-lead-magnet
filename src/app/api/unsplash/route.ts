import { NextRequest, NextResponse } from 'next/server';

interface UnsplashPhoto {
  url: string;
  thumbUrl: string;
  attribution: {
    photographer: string;
    profileUrl: string;
  };
}

// Simple in-memory cache with 24hr TTL
const cache = new Map<string, { data: UnsplashPhoto; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): UnsplashPhoto | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: UnsplashPhoto): void {
  // Limit cache size to prevent memory issues
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const orientation = searchParams.get('orientation') || 'landscape';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'Unsplash not configured' }, { status: 503 });
  }

  // Check cache
  const cacheKey = `${query}:${orientation}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', orientation);
    url.searchParams.set('per_page', '1');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`);
      return NextResponse.json({ error: 'Unsplash API error' }, { status: response.status });
    }

    const data = await response.json();
    const photo = data.results?.[0];

    if (!photo) {
      return NextResponse.json({ error: 'No photos found' }, { status: 404 });
    }

    const result: UnsplashPhoto = {
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      attribution: {
        photographer: photo.user.name,
        profileUrl: photo.user.links.html,
      },
    };

    setCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
