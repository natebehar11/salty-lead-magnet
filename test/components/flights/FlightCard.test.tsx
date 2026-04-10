import { render, screen, fireEvent } from '@testing-library/react';
import FlightCard from '@/components/flights/FlightCard';
import { createMockFlight, createMockSegment } from '@test/helpers/store-mocks';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { FALLBACK_RATES } from '@/lib/currency';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

beforeEach(() => {
  useFlightStore.setState({
    selectedOutboundIds: [],
    favouriteFlightIds: [],
  });
  useCurrencyStore.setState({
    selectedCurrency: 'USD',
    rates: { ...FALLBACK_RATES },
  });
});

describe('FlightCard', () => {
  it('renders airline name', () => {
    const flight = createMockFlight();
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('Air Canada')).toBeInTheDocument();
  });

  it('renders departure and arrival times', () => {
    const flight = createMockFlight({
      segments: [
        createMockSegment({
          departure: { airport: 'YYZ', time: '08:30', date: '2026-01-02' },
          arrival: { airport: 'SJO', time: '14:45', date: '2026-01-02' },
        }),
      ],
    });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText('14:45')).toBeInTheDocument();
  });

  it('renders price with currency conversion', () => {
    const flight = createMockFlight({ price: 500 });
    render(<FlightCard flight={flight} />);
    // USD rate is 1, so $500
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('does not show checkbox by default', () => {
    const flight = createMockFlight();
    render(<FlightCard flight={flight} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows checkbox when showCheckbox is true', () => {
    const flight = createMockFlight();
    render(<FlightCard flight={flight} showCheckbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('toggles outbound selection via store when checkbox is clicked', () => {
    const flight = createMockFlight({ id: 'test-flight-1' });
    render(<FlightCard flight={flight} showCheckbox />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(useFlightStore.getState().selectedOutboundIds).toContain('test-flight-1');

    fireEvent.click(checkbox);
    expect(useFlightStore.getState().selectedOutboundIds).not.toContain('test-flight-1');
  });

  it('uses onToggleSelection prop when provided', () => {
    const onToggle = vi.fn();
    const flight = createMockFlight({ id: 'custom-toggle' });
    render(<FlightCard flight={flight} showCheckbox isSelected={false} onToggleSelection={onToggle} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('custom-toggle');
  });

  it('shows "Direct" for non-stop flights', () => {
    const flight = createMockFlight({ stops: 0 });
    render(<FlightCard flight={flight} />);
    expect(screen.getAllByText('Direct').length).toBeGreaterThan(0);
  });

  it('shows stop count for connecting flights', () => {
    const flight = createMockFlight({ stops: 2 });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('2 stops')).toBeInTheDocument();
  });

  it('shows Self-Transfer badge when isSelfTransfer is true', () => {
    const flight = createMockFlight({ isSelfTransfer: true });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('Self-Transfer')).toBeInTheDocument();
  });

  it('shows Alt Airport badge when isAlternateAirport is true', () => {
    const flight = createMockFlight({ isAlternateAirport: true });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('Alt Airport')).toBeInTheDocument();
  });

  it('shows self-transfer warning when applicable', () => {
    const flight = createMockFlight({
      isSelfTransfer: true,
      selfTransferWarning: 'You need to recollect bags.',
    });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('You need to recollect bags.')).toBeInTheDocument();
  });

  it('shows alternate airport note when applicable', () => {
    const flight = createMockFlight({
      isAlternateAirport: true,
      alternateAirportNote: 'Flies into a nearby airport.',
    });
    render(<FlightCard flight={flight} />);
    expect(screen.getByText('Flies into a nearby airport.')).toBeInTheDocument();
  });

  it('renders View flight link', () => {
    const flight = createMockFlight({ bookingUrl: 'https://example.com/book' });
    render(<FlightCard flight={flight} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/book');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
