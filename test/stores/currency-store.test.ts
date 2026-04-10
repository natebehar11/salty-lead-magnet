import { useCurrencyStore } from '@/stores/currency-store';
import { fetchExchangeRates, FALLBACK_RATES } from '@/lib/currency';

vi.mock('@/lib/currency', async () => {
  const actual = await vi.importActual('@/lib/currency');
  return { ...actual, fetchExchangeRates: vi.fn() };
});

const mockedFetchRates = fetchExchangeRates as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  useCurrencyStore.setState({
    selectedCurrency: 'USD',
    rates: { ...FALLBACK_RATES },
    lastFetched: null,
    isLoading: false,
    isStale: true,
  });
});

describe('useCurrencyStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useCurrencyStore.getState();
      expect(state.selectedCurrency).toBe('USD');
      expect(state.rates.USD).toBe(1);
      expect(state.isStale).toBe(true);
    });
  });

  describe('setCurrency', () => {
    it('updates selectedCurrency', () => {
      useCurrencyStore.getState().setCurrency('EUR');
      expect(useCurrencyStore.getState().selectedCurrency).toBe('EUR');
    });
  });

  describe('fetchRates', () => {
    it('calls fetchExchangeRates and updates rates when no lastFetched', async () => {
      const freshRates = { USD: 1, CAD: 1.4, EUR: 0.95, GBP: 0.8, AUD: 1.6 };
      mockedFetchRates.mockResolvedValueOnce({ rates: freshRates, isStale: false });

      await useCurrencyStore.getState().fetchRates();
      const state = useCurrencyStore.getState();

      expect(mockedFetchRates).toHaveBeenCalledTimes(1);
      expect(state.rates).toEqual(freshRates);
      expect(state.isStale).toBe(false);
      expect(state.lastFetched).not.toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('does NOT call fetchExchangeRates when lastFetched is recent', async () => {
      useCurrencyStore.setState({ lastFetched: Date.now() });

      await useCurrencyStore.getState().fetchRates();

      expect(mockedFetchRates).not.toHaveBeenCalled();
    });
  });
});
