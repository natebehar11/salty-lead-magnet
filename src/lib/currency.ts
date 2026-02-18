export type CurrencyCode = 'USD' | 'CAD' | 'GBP' | 'EUR' | 'AUD';

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'CAD', label: 'CAD', symbol: 'CA$' },
  { code: 'GBP', label: 'GBP', symbol: '£' },
  { code: 'EUR', label: 'EUR', symbol: '€' },
  { code: 'AUD', label: 'AUD', symbol: 'A$' },
];

export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.55,
};

export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchExchangeRates(): Promise<{ rates: Record<CurrencyCode, number>; isStale: boolean }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    const rates: Record<CurrencyCode, number> = { USD: 1 } as Record<CurrencyCode, number>;
    for (const currency of SUPPORTED_CURRENCIES) {
      if (currency.code === 'USD') continue;
      rates[currency.code] = data.rates?.[currency.code] ?? FALLBACK_RATES[currency.code];
    }

    return { rates, isStale: false };
  } catch {
    return { rates: { ...FALLBACK_RATES }, isStale: true };
  }
}

export function convertAmount(amountUSD: number, rate: number): number {
  return Math.round(amountUSD * rate);
}
