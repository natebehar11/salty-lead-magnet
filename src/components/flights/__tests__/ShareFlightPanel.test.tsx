import { render, screen } from '@testing-library/react';
import ShareFlightPanel from '../ShareFlightPanel';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { FALLBACK_RATES } from '@/lib/currency';
import { createMockFlight } from '@/test/store-mocks';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock ShareButton component
vi.mock('@/components/shared/ShareButton', () => ({
  default: () => <div data-testid="share-button">ShareButton</div>,
}));

beforeEach(() => {
  useFlightStore.setState({
    hasSubmittedLead: false,
    leadData: null,
    selectedOutboundIds: [],
    selectedReturnIds: [],
  });
  useCurrencyStore.setState({
    selectedCurrency: 'USD',
    rates: { ...FALLBACK_RATES },
  });
});

describe('ShareFlightPanel', () => {
  const departingFlights = [
    createMockFlight({ id: 'dep-1', price: 400 }),
    createMockFlight({ id: 'dep-2', price: 600 }),
  ];
  const returnFlights = [
    createMockFlight({ id: 'ret-1', price: 350 }),
  ];

  it('returns null when user has not submitted lead', () => {
    const { container } = render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when there are no flights', () => {
    useFlightStore.setState({ hasSubmittedLead: true });
    const { container } = render(
      <ShareFlightPanel departingFlights={[]} returnFlights={[]} retreatName="Costa Rica v4" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when user has submitted lead and flights exist', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(screen.getByText('Save These Flight Plans')).toBeInTheDocument();
  });

  it('shows departing and return tabs', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(screen.getByText(/Departing/)).toBeInTheDocument();
    expect(screen.getByText(/Return/)).toBeInTheDocument();
  });

  it('shows selection counts for departing and return', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
      selectedOutboundIds: ['dep-1'],
      selectedReturnIds: ['ret-1'],
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(screen.getByText(/1 departing, 1 return selected/)).toBeInTheDocument();
  });

  it('shows Email Me and WhatsApp Me buttons', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(screen.getByText('Email Me')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Me')).toBeInTheDocument();
  });

  it('disables send buttons when no flights are selected', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
      selectedOutboundIds: [],
      selectedReturnIds: [],
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    const emailBtn = screen.getByText('Email Me').closest('button');
    const whatsappBtn = screen.getByText('WhatsApp Me').closest('button');
    expect(emailBtn).toBeDisabled();
    expect(whatsappBtn).toBeDisabled();
  });

  it('shows Share with Friends link', () => {
    useFlightStore.setState({
      hasSubmittedLead: true,
      leadData: { firstName: 'Nate', email: 'nate@test.com', whatsappNumber: '+1' },
    });
    render(
      <ShareFlightPanel departingFlights={departingFlights} returnFlights={returnFlights} retreatName="Costa Rica v4" />
    );
    expect(screen.getByText('Share with Friends')).toBeInTheDocument();
  });
});
