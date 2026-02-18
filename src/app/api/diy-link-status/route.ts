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
  try {
    const kvModule = await (Function('return import("@vercel/kv")')() as Promise<{ kv: { get: (key: string) => Promise<string | null> } }>);
    const raw = await kvModule.kv.get('diy-link-status');

    if (!raw) {
      return NextResponse.json({ results: {}, lastRun: null });
    }

    const payload: LinkStatusPayload = typeof raw === 'string' ? JSON.parse(raw) : raw as LinkStatusPayload;
    return NextResponse.json(payload);
  } catch {
    // KV not configured or not available
    return NextResponse.json({ results: {}, lastRun: null });
  }
}
