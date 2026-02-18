import {
  SUPPORTED_CURRENCIES,
  FALLBACK_RATES,
  convertAmount,
  fetchExchangeRates,
} from '@/lib/currency';

describe('SUPPORTED_CURRENCIES', () => {
  it('has 5 entries', () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(5);
  });

  it('each entry has code, label, and symbol', () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      expect(currency).toHaveProperty('code');
      expect(currency).toHaveProperty('label');
      expect(currency).toHaveProperty('symbol');
    }
  });
});

describe('FALLBACK_RATES', () => {
  it('has USD rate of 1', () => {
    expect(FALLBACK_RATES.USD).toBe(1);
  });

  it('all rates are greater than 0', () => {
    for (const rate of Object.values(FALLBACK_RATES)) {
      expect(rate).toBeGreaterThan(0);
    }
  });
});

describe('convertAmount', () => {
  it('converts 100 USD at rate 1.36 to 136', () => {
    expect(convertAmount(100, 1.36)).toBe(136);
  });

  it('rounds to the nearest integer', () => {
    expect(convertAmount(100, 1.365)).toBe(137);
  });

  it('returns 0 for 0 amount regardless of rate', () => {
    expect(convertAmount(0, 1.36)).toBe(0);
  });
});

describe('fetchExchangeRates', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns rates with isStale false on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          rates: { CAD: 1.4, EUR: 0.93, GBP: 0.8, AUD: 1.6 },
        }),
    });

    const result = await fetchExchangeRates();
    expect(result.isStale).toBe(false);
    expect(result.rates.USD).toBe(1);
    expect(result.rates.CAD).toBe(1.4);
  });

  it('returns FALLBACK_RATES with isStale true on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchExchangeRates();
    expect(result.isStale).toBe(true);
    expect(result.rates).toEqual(FALLBACK_RATES);
  });
});
