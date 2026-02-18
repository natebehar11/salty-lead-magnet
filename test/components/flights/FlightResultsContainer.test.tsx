import { render, screen, fireEvent } from '@testing-library/react';
import FlightResultsContainer from '@/components/flights/FlightResultsContainer';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { FALLBACK_RATES } from '@/lib/currency';
import { createMockSearchResults } from '@test/helpers/store-mocks';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      // Filter out framer-motion specific props
      const htmlProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (!['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants', 'layout'].includes(key)) {
          htmlProps[key] = value;
        }
      }
      return <div {...htmlProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock alliance data
vi.mock('@/data/alliances', () => ({
  flightMatchesAlliances: () => true,
  ALLIANCES: [],
}));

// Mock child components that aren't being tested here
vi.mock('@/components/flights/FlightDateTabs', () => ({
  default: () => <div data-testid="flight-date-tabs">DateTabs</div>,
}));

vi.mock('@/components/flights/AllianceFilter', () => ({
  default: () => <div data-testid="alliance-filter">AllianceFilter</div>,
}));

vi.mock('@/components/flights/UnlistedPathsSection', () => ({
  default: () => null,
}));

vi.mock('@/components/flights/ShareFlightPanel', () => ({
  default: () => null,
}));

vi.mock('@/components/shared/HumanCTA', () => ({
  default: () => null,
}));

beforeEach(() => {
  useFlightStore.setState({
    searchResults: null,
    sortMode: 'best',
    selectedDate: 'day-before',
    filters: { maxStops: null, maxDuration: null, maxPrice: 3500, alliances: [] },
    isLoading: false,
    selectedOutboundIds: [],
    selectedReturnIds: [],
    returnResults: null,
    isReturnMode: false,
    originAirport: { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
    selectedRetreatSlug: 'costa-rica-v4',
  });
  useCurrencyStore.setState({
    selectedCurrency: 'USD',
    rates: { ...FALLBACK_RATES },
  });
});

describe('FlightResultsContainer', () => {
  it('returns null when no searchResults and not loading', () => {
    const { container } = render(<FlightResultsContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading skeleton when isLoading is true', () => {
    useFlightStore.setState({ isLoading: true });
    render(<FlightResultsContainer />);
    expect(screen.getByText(/Searching for the best flights/)).toBeInTheDocument();
  });

  it('renders flight results when searchResults exist', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);
    expect(screen.getByText(/Toronto/)).toBeInTheDocument();
    expect(screen.getByText(/San José/)).toBeInTheDocument();
  });

  it('renders sort mode buttons', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);
    expect(screen.getByText('Cheapest')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    expect(screen.getByText('Fastest')).toBeInTheDocument();
  });

  it('switches sort mode when clicking a sort button', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);

    fireEvent.click(screen.getByText('Cheapest'));
    expect(useFlightStore.getState().sortMode).toBe('cheapest');
  });

  it('shows "No flights match" when all flights are filtered out', () => {
    const results = createMockSearchResults({
      best: [],
      cheapest: [],
      fastest: [],
    });
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);
    expect(screen.getByText('No flights match your filters.')).toBeInTheDocument();
  });

  it('shows selection bar when outbound flights are selected', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({
      searchResults: results,
      selectedOutboundIds: ['f1'],
    });
    render(<FlightResultsContainer />);
    expect(screen.getByText(/1 flight selected/)).toBeInTheDocument();
    expect(screen.getByText('Search Return Flights')).toBeInTheDocument();
  });

  it('shows clear button that clears outbound selection', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({
      searchResults: results,
      selectedOutboundIds: ['f1', 'f2'],
    });
    render(<FlightResultsContainer />);

    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);
    expect(useFlightStore.getState().selectedOutboundIds).toEqual([]);
  });

  it('renders filter sliders (stops, duration, max price)', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);
    expect(screen.getByText('Stops:')).toBeInTheDocument();
    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('Max $:')).toBeInTheDocument();
  });

  it('shows "Clear all" button when filters are active', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({
      searchResults: results,
      filters: { maxStops: 1, maxDuration: null, maxPrice: null, alliances: [] },
    });
    render(<FlightResultsContainer />);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('renders FlightDateTabs and AllianceFilter', () => {
    const results = createMockSearchResults();
    useFlightStore.setState({ searchResults: results });
    render(<FlightResultsContainer />);
    expect(screen.getByTestId('flight-date-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('alliance-filter')).toBeInTheDocument();
  });

  it('shows return flight view when in return mode with results', () => {
    const departingResults = createMockSearchResults();
    const returnResults = createMockSearchResults({
      search: {
        ...departingResults.search,
        origin: departingResults.search.destination,
        destination: departingResults.search.origin,
      },
    });

    useFlightStore.setState({
      searchResults: departingResults,
      returnResults,
      isReturnMode: true,
      selectedOutboundIds: ['f1'],
    });

    render(<FlightResultsContainer />);
    expect(screen.getByText(/Back to Departing Flights/)).toBeInTheDocument();
  });
});
