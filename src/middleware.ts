import { NextRequest, NextResponse } from 'next/server';
import {
  plannerChatLimiter,
  flightsSearchLimiter,
  leadCaptureLimiter,
} from '@/lib/rate-limit';

/** Map of route prefixes to their rate limiter instances */
const RATE_LIMITED_ROUTES = [
  { prefix: '/api/planner/chat', limiter: plannerChatLimiter },
  { prefix: '/api/flights/search', limiter: flightsSearchLimiter },
  { prefix: '/api/leads/capture', limiter: leadCaptureLimiter },
] as const;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const route of RATE_LIMITED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      const ip = getClientIp(request);
      const result = route.limiter.check(ip);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/planner/chat/:path*',
    '/api/flights/search/:path*',
    '/api/leads/capture/:path*',
  ],
};
