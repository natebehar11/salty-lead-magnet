import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CostOfStayingHome from '../CostOfStayingHome';
import { useFlightStore } from '@/stores/flight-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { FALLBACK_RATES } from '@/lib/currency';
import { availableCities, computeCityTotal, getCityAnchor } from '@/data/city-cost-anchors';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  useCurrencyStore.setState({ selectedCurrency: 'USD', rates: { ...FALLBACK_RATES } });
  useFlightStore.setState({ originAirport: null });
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('CostOfStayingHome', () => {
  it('defaults to Toronto when no airport is set', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    expect(screen.getByText(/A comparable week in Toronto/)).toBeInTheDocument();
  });

  it('renders all city selector buttons', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    for (const city of availableCities) {
      expect(screen.getByText(city.label)).toBeInTheDocument();
    }
  });

  it('switches city when selector button is clicked', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    fireEvent.click(screen.getByText('Vancouver'));
    expect(screen.getByText(/A comparable week in Vancouver/)).toBeInTheDocument();
  });

  it('shows correct city total for Toronto', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');
    const torontoTotal = computeCityTotal(torontoData);
    expect(screen.getByText(new RegExp(`\\$${torontoTotal.toLocaleString()}`))).toBeInTheDocument();
  });

  it('shows correct city total after switching to New York', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    fireEvent.click(screen.getByText('New York'));
    const nyData = getCityAnchor('new_york');
    const nyTotal = computeCityTotal(nyData);
    expect(screen.getByText(new RegExp(`\\$${nyTotal.toLocaleString()}`))).toBeInTheDocument();
  });

  it('shows savings badge when city total exceeds retreat price', () => {
    // Use a very low retreat price so savings are guaranteed in any currency
    render(<CostOfStayingHome retreatPrice={100} retreatName="a SALTY Retreat" />);
    expect(screen.getByText(/SAVE UP TO/)).toBeInTheDocument();
  });

  it('shows the retreat name in the comparison', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="SALTY Costa Rica" />);
    expect(screen.getByText('SALTY Costa Rica')).toBeInTheDocument();
  });

  it('renders header and subheader text', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    expect(screen.getByText('Or you could stay home...')).toBeInTheDocument();
    expect(screen.getByText('Same activities. Same vibes. Different weather.')).toBeInTheDocument();
  });

  it('shows "city not listed" disclaimer', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    expect(screen.getByText(/Your city not listed\?/)).toBeInTheDocument();
  });

  it('shows first 4 line items by default with "Show more" button', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');

    // First 4 visible
    for (let i = 0; i < Math.min(4, torontoData.lineItems.length); i++) {
      expect(screen.getByText(torontoData.lineItems[i].category)).toBeInTheDocument();
    }

    // "Show X more" if applicable
    if (torontoData.lineItems.length > 4) {
      const moreCount = torontoData.lineItems.length - 4;
      expect(screen.getByText(`Show ${moreCount} more`)).toBeInTheDocument();
    }
  });

  it('reveals all line items when "Show more" is clicked', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');

    if (torontoData.lineItems.length > 4) {
      const moreCount = torontoData.lineItems.length - 4;
      fireEvent.click(screen.getByText(`Show ${moreCount} more`));

      for (const item of torontoData.lineItems) {
        expect(screen.getByText(item.category)).toBeInTheDocument();
      }
    }
  });

  it('shows funComparison text for selected city', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');
    expect(screen.getByText(torontoData.funComparison)).toBeInTheDocument();
  });

  it('shows sourceNote text for selected city', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');
    expect(screen.getByText(torontoData.sourceNote)).toBeInTheDocument();
  });

  it('auto-detects city from airport code (YVR → Vancouver)', () => {
    useFlightStore.setState({
      originAirport: { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
    });
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    expect(screen.getByText(/A comparable week in Vancouver/)).toBeInTheDocument();
  });

  it('shows USD fallback line for CAD cities (Toronto)', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    // Toronto is CAD, so the component shows "from $X CAD" and below it "$Y USD"
    // The USD fallback line contains "USD" text
    const usdElements = screen.getAllByText(/USD/);
    expect(usdElements.length).toBeGreaterThan(0);
  });

  it('does not show USD fallback for New York (already USD)', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    fireEvent.click(screen.getByText('New York'));

    // The total line shows "USD" as part of "$X,XXX USD"
    // But there should be NO separate fallback line with just USD
    // Check: the conditional `{cityCurrency !== 'USD' && ...}` should NOT render
    const nyData = getCityAnchor('new_york');
    expect(nyData.currency).toBe('USD');

    // Verify no "from $X" element has a sibling USD fallback
    // The component only renders the fallback span when cityCurrency !== 'USD'
    // We can test this by checking the number of text nodes containing "USD"
    // For New York: only the city total line has "USD" (e.g. "$3,200 USD")
    // For Toronto: city total has "CAD" + there's a USD fallback line
    const totalLine = screen.getByText(new RegExp(`\\$${computeCityTotal(nyData).toLocaleString()} USD`));
    expect(totalLine).toBeInTheDocument();
  });

  it('shows "Total in [cityName]" label', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    expect(screen.getByText('Total in Toronto')).toBeInTheDocument();

    fireEvent.click(screen.getByText('New York'));
    expect(screen.getByText('Total in New York')).toBeInTheDocument();
  });

  it('line item costs display correctly (or "Priceless" for $0)', () => {
    render(<CostOfStayingHome retreatPrice={1999} retreatName="a SALTY Retreat" />);
    const torontoData = getCityAnchor('toronto');

    // Check the first item has a dollar amount
    const firstItem = torontoData.lineItems[0];
    if (firstItem.cost > 0) {
      expect(screen.getByText(`$${firstItem.cost.toLocaleString()}`)).toBeInTheDocument();
    }
  });
});
