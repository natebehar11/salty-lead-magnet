import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createJSONStorage } from 'zustand/middleware';
import { convertAmount } from './currency';

/**
 * Generate a unique ID for messages, board items, and other entities.
 * Uses crypto.randomUUID() with an optional prefix for readability.
 */
export function generateId(prefix = ''): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * Merge Tailwind classes with proper conflict resolution.
 * Uses clsx for conditional logic + tailwind-merge for deduplication.
 * e.g. cn('px-4', condition && 'px-6') → 'px-6' (not 'px-4 px-6')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return 'TBD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const startMonth = start.toLocaleString('en-US', { month: 'long' });
  const endMonth = end.toLocaleString('en-US', { month: 'long' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * localStorage wrapper that gracefully handles quota errors and
 * unavailable storage (SSR, private browsing). Zustand persist will
 * fall back to in-memory state when writes fail instead of crashing.
 */
const safeStorageBackend: Storage = {
  get length() { try { return localStorage.length; } catch { return 0; } },
  clear() { try { localStorage.clear(); } catch { /* noop */ } },
  key(index: number) { try { return localStorage.key(index); } catch { return null; } },
  getItem(name: string): string | null {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name: string, value: string): void {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      // QuotaExceededError or SecurityError in private browsing
      console.warn(`[safeStorage] write failed for "${name}":`, e);
    }
  },
  removeItem(name: string): void {
    try {
      localStorage.removeItem(name);
    } catch {
      // noop — removal failure is non-critical
    }
  },
};

/** Safe Zustand persist storage — wraps localStorage with quota error handling */
export const safeStorage = createJSONStorage(() => safeStorageBackend);

export function convertAndFormatCurrency(
  amountUSD: number,
  targetCurrency: string,
  rate: number | undefined
): { converted: string; original: string; isConverted: boolean } {
  if (amountUSD === 0) {
    return { converted: 'TBD', original: 'TBD', isConverted: false };
  }
  if (targetCurrency === 'USD' || rate == null) {
    const formatted = formatCurrency(amountUSD, 'USD');
    return { converted: formatted, original: formatted, isConverted: false };
  }
  const convertedAmount = convertAmount(amountUSD, rate);
  return {
    converted: formatCurrency(convertedAmount, targetCurrency),
    original: formatCurrency(amountUSD, 'USD'),
    isConverted: true,
  };
}
