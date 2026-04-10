import { NextResponse } from 'next/server';

interface LinkCheckResult {
  url: string;
  valid: boolean;
  statusCode: number | null;
  checkedAt: string;
}

interface LinkStatusPayload {
  results: Record<string, LinkCheckResult>;
  lastRun: string;
}

export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return NextResponse.json({ results: {}, lastRun: null });
  }

  try {
    const res = await fetch(`${kvUrl}/get/diy-link-status`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });

    if (!res.ok) {
      return NextResponse.json({ results: {}, lastRun: null });
    }

    const data = await res.json();
    if (!data.result) {
      return NextResponse.json({ results: {}, lastRun: null });
    }

    const payload: LinkStatusPayload = typeof data.result === 'string'
      ? JSON.parse(data.result)
      : data.result as LinkStatusPayload;
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ results: {}, lastRun: null });
  }
}
