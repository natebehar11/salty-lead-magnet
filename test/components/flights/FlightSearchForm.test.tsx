import { render, screen, fireEvent } from '@testing-library/react';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import { useFlightStore } from '@/stores/flight-store';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock airports data
vi.mock('@/data/airports', () => ({
  searchAirports: vi.fn((query: string) => {
    if (query.toLowerCase().includes('tor') || query.toLowerCase().includes('yyz')) {
      return [
        { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      ];
    }
    return [];
  }),
}));

// Mock retreats data
vi.mock('@/data/retreats', () => ({
  getUpcomingRetreats: () => [
    {
      slug: 'costa-rica-v4',
      destination: 'Costa Rica',
      startDate: '2026-01-03',
      endDate: '2026-01-10',
      status: 'open',
    },
    {
      slug: 'sri-lanka',
      destination: 'Sri Lanka',
      startDate: '2026-03-15',
      endDate: '2026-03-22',
      status: 'open',
    },
  ],
}));

beforeEach(() => {
  useFlightStore.setState({
    originAirport: null,
    selectedRetreatSlug: null,
    compareAll: false,
  });
});

describe('FlightSearchForm', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders the search form with heading', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    expect(screen.getByText('Where are you flying from?')).toBeInTheDocument();
  });

  it('renders airport input field', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText(/Search by city or airport code/)).toBeInTheDocument();
  });

  it('shows search button disabled when no airport selected', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    const button = screen.getByRole('button', { name: /Find My Flights/i });
    expect(button).toBeDisabled();
  });

  it('shows airport suggestions when typing', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by city or airport code/);
    fireEvent.change(input, { target: { value: 'tor' } });
    expect(screen.getByText('YYZ')).toBeInTheDocument();
    expect(screen.getByText(/Toronto, Canada/)).toBeInTheDocument();
  });

  it('selects an airport from suggestions', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search by city or airport code/);
    fireEvent.change(input, { target: { value: 'tor' } });

    // Click on the airport suggestion
    const suggestion = screen.getByText('YYZ');
    fireEvent.click(suggestion);

    expect(useFlightStore.getState().originAirport?.code).toBe('YYZ');
  });

  it('renders retreat selection cards', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);
    expect(screen.getByText('Costa Rica')).toBeInTheDocument();
    expect(screen.getByText('Sri Lanka')).toBeInTheDocument();
  });

  it('toggles between specific trip and compare mode', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const compareBtn = screen.getByRole('button', { name: /Compare Trips/i });
    fireEvent.click(compareBtn);
    expect(useFlightStore.getState().compareAll).toBe(true);

    const specificBtn = screen.getByRole('button', { name: /Specific Trip/i });
    fireEvent.click(specificBtn);
    expect(useFlightStore.getState().compareAll).toBe(false);
  });

  it('selects a retreat when clicked', () => {
    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const costaRica = screen.getByText('Costa Rica');
    fireEvent.click(costaRica);
    expect(useFlightStore.getState().selectedRetreatSlug).toBe('costa-rica-v4');
  });

  it('calls onSearch when form is submitted with valid inputs', () => {
    // Pre-set the airport in the store
    useFlightStore.setState({
      originAirport: { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      selectedRetreatSlug: 'costa-rica-v4',
    });

    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /Find My Flights/i });
    fireEvent.click(button);
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('does not call onSearch when no retreat is selected (non-compare mode)', () => {
    useFlightStore.setState({
      originAirport: { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada' },
      selectedRetreatSlug: null,
      compareAll: false,
    });

    render(<FlightSearchForm onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /Find My Flights/i });
    fireEvent.click(button);
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
