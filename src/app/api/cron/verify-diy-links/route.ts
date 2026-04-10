import { NextRequest, NextResponse } from 'next/server';
import { getAllDIYComparisons } from '@/data/diy-pricing';

interface LinkCheckResult {
  url: string;
  valid: boolean;
  statusCode: number | null;
  checkedAt: string;
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const comparisons = getAllDIYComparisons();

  // Extract all unique source URLs
  const urls = new Set<string>();
  for (const comparison of comparisons) {
    for (const item of comparison.items) {
      if (item.sourceUrl) urls.add(item.sourceUrl);
    }
  }

  const results: Record<string, LinkCheckResult> = {};
  let brokenCount = 0;

  // Check each URL with a HEAD request (10s timeout)
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      const valid = res.status >= 200 && res.status < 400;
      if (!valid) brokenCount++;

      results[url] = {
        url,
        valid,
        statusCode: res.status,
        checkedAt: new Date().toISOString(),
      };
    } catch {
      brokenCount++;
      results[url] = {
        url,
        valid: false,
        statusCode: null,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  const payload = {
    results,
    lastRun: new Date().toISOString(),
  };

  // Persist results to Vercel KV via REST API (same storage as read endpoint)
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/diy-link-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(payload)),
      });
    } catch (kvErr) {
      console.warn('KV write failed, link status not persisted:', kvErr);
    }
  } else {
    console.warn('KV_REST_API_URL or KV_REST_API_TOKEN not set, link status not persisted');
  }

  if (brokenCount > 0) {
    console.warn(`DIY link check: ${brokenCount} broken link(s) out of ${urls.size}`);
  }

  return NextResponse.json({ checked: urls.size, broken: brokenCount });
}
