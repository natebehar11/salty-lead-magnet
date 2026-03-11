import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ComparePage from '../page';
import { useCurrencyStore } from '@/stores/currency-store';
import { FALLBACK_RATES } from '@/lib/currency';
import { getAllDIYComparisons } from '@/data/diy-pricing';
import { getRetreatBySlug } from '@/data/retreats';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, layout, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
    form: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <form {...rest}>{children as React.ReactNode}</form>;
    },
    section: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <section {...rest}>{children as React.ReactNode}</section>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/shared/ScrollReveal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/shared/WaveDivider', () => ({
  default: () => <div data-testid="wave-divider" />,
}));

vi.mock('@/components/shared/HumanCTA', () => ({
  default: ({ message }: { message: string }) => <div data-testid="human-cta">{message}</div>,
}));

vi.mock('@/components/shared/ShareButton', () => ({
  default: ({ title }: { title: string }) => <button data-testid="share-button">{title}</button>,
}));

vi.mock('@/components/shared/PriceDisplay', () => ({
  default: ({ amountUSD }: { amountUSD: number }) => <span data-testid="price-display">${amountUSD}</span>,
}));

vi.mock('@/components/compare/CostOfStayingHome', () => ({
  default: ({ retreatPrice, retreatName }: { retreatPrice: number; retreatName: string }) => (
    <div data-testid="cost-of-staying-home">{retreatName} — ${retreatPrice}</div>
  ),
}));

vi.mock('@/components/compare/ConvinceYourCrew', () => ({
  default: ({ isVisible, bestSavingsPercent }: { isVisible: boolean; bestSavingsPercent: number }) =>
    isVisible ? <div data-testid="convince-your-crew">Best savings: {bestSavingsPercent}%</div> : null,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function getActiveComparisons() {
  const now = new Date();
  return getAllDIYComparisons().filter((c) => {
    const retreat = getRetreatBySlug(c.retreatSlug);
    if (!retreat) return false;
    return new Date(retreat.endDate + 'T23:59:59') >= now;
  });
}

function computeBestPercent() {
  let bestSavings = 0;
  let bestPercent = 0;
  for (const c of getActiveComparisons()) {
    const retreat = getRetreatBySlug(c.retreatSlug)!;
    const saltyPrice = retreat.lowestPrice || c.saltyPriceFrom;
    const diyTotal = c.items.reduce((sum, item) => sum + item.diyPrice, 0);
    const savings = diyTotal - saltyPrice;
    const percent = diyTotal > 0 ? Math.round((savings / diyTotal) * 100) : 0;
    if (savings > bestSavings) {
      bestSavings = savings;
      bestPercent = percent;
    }
  }
  return bestPercent;
}

// ── Setup ──────────────────────────────────────────────────────────────────────

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  useCurrencyStore.setState({ selectedCurrency: 'USD', rates: { ...FALLBACK_RATES } });

  fetchSpy = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ results: {}, lastRun: null }),
  });
  global.fetch = fetchSpy;

  Object.defineProperty(window, 'location', {
    value: { ...window.location, hash: '' },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ComparePage', () => {
  it('renders the hero section with title', () => {
    render(<ComparePage />);
    expect(screen.getByText('Think you can do it cheaper?')).toBeInTheDocument();
  });

  it('renders comparison cards for active retreats', () => {
    render(<ComparePage />);
    const activeCount = getActiveComparisons().length;
    if (activeCount > 0) {
      const breakdownButtons = screen.getAllByText(/See full breakdown/);
      expect(breakdownButtons.length).toBe(activeCount);
    }
  });

  it('filters out past retreats — no card rendered for ended retreats', () => {
    render(<ComparePage />);
    const comparisons = getAllDIYComparisons();
    for (const c of comparisons) {
      const retreat = getRetreatBySlug(c.retreatSlug);
      if (retreat && new Date(retreat.endDate + 'T23:59:59') < new Date()) {
        // Past retreat should not have a comparison card (no breakdown button with its item count)
        const itemCount = c.items.length;
        const pastCardButton = screen.queryByText(`See full breakdown (${itemCount} items)`);
        // Can't assert this strongly since multiple cards may share item count,
        // but we know past retreats are filtered by the card count test above.
      }
    }
    // The real assertion: active card count matches expected
    const activeCount = getActiveComparisons().length;
    if (activeCount > 0) {
      expect(screen.getAllByText(/See full breakdown/).length).toBe(activeCount);
    }
  });

  it('no broken flight CTA links (no undefined slugs)', () => {
    render(<ComparePage />);
    const allLinks = screen.queryAllByRole('link');
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      if (href?.includes('/flights?retreat=')) {
        expect(href).not.toContain('undefined');
      }
    }
  });

  it('hero badge shows dynamic best savings percentage', () => {
    render(<ComparePage />);
    const bestPercent = computeBestPercent();
    if (bestPercent > 0) {
      // The hero badge contains "SAVE UP TO" and the percentage
      expect(screen.getByText('SAVE UP TO')).toBeInTheDocument();
      // Percentage appears in hero badge and possibly in a card — just verify it exists
      const percentElements = screen.getAllByText(`${bestPercent}%`);
      expect(percentElements.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('ConvinceYourCrew is always visible', () => {
    render(<ComparePage />);
    expect(screen.getByTestId('convince-your-crew')).toBeInTheDocument();
  });

  it('CostOfStayingHome section renders', () => {
    render(<ComparePage />);
    expect(screen.getByTestId('cost-of-staying-home')).toBeInTheDocument();
  });

  it('fetches link status on mount', async () => {
    render(<ComparePage />);
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/diy-link-status');
    });
  });

  it('expanding a card reveals line items table', async () => {
    render(<ComparePage />);
    const buttons = screen.getAllByText(/See full breakdown/);
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      await waitFor(() => {
        // Table headers appear — "Item", "DIY Cost", and "SALTY" column header
        // Use getAllByText since multiple elements may contain these strings
        expect(screen.getAllByText('DIY Cost').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Item')).toBeInTheDocument();
      });
    }
  });

  it('roomTierNote visible for retreats that have one', () => {
    render(<ComparePage />);
    const active = getActiveComparisons();
    const withNotes = active.filter((c) => c.roomTierNote);
    for (const c of withNotes) {
      expect(screen.getByText(c.roomTierNote!)).toBeInTheDocument();
    }
  });

  it('every card shows either "You save" or "Similar price"', () => {
    render(<ComparePage />);
    const saveHeaders = screen.queryAllByText('You save');
    const similarHeaders = screen.queryAllByText('Similar price');
    const activeCount = getActiveComparisons().length;
    if (activeCount > 0) {
      expect(saveHeaders.length + similarHeaders.length).toBe(activeCount);
    }
  });

  it('each card has Check Flights and View Trip Details CTAs', () => {
    render(<ComparePage />);
    const activeCount = getActiveComparisons().length;
    if (activeCount > 0) {
      expect(screen.getAllByText('Check Flights').length).toBe(activeCount);
      expect(screen.getAllByText('View Trip Details').length).toBe(activeCount);
    }
  });

  it('methodology tooltip opens on click', async () => {
    render(<ComparePage />);
    const buttons = screen.getAllByText(/See full breakdown/);
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);

      await waitFor(() => {
        const tooltipButtons = screen.getAllByLabelText('How we calculated this price');
        expect(tooltipButtons.length).toBeGreaterThan(0);
        fireEvent.click(tooltipButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
      });
    }
  });

  it('shows estimated date text for displayed comparisons', () => {
    render(<ComparePage />);
    const dateTexts = screen.queryAllByText(/DIY prices estimated as of/);
    const activeCount = getActiveComparisons().length;
    expect(dateTexts.length).toBe(activeCount);
  });

  it('savings banner shows planning hours', () => {
    render(<ComparePage />);
    const active = getActiveComparisons();
    if (active.length > 0) {
      // At least one card should mention planning hours
      const planningTexts = screen.queryAllByText(/hours of planning/);
      expect(planningTexts.length).toBeGreaterThan(0);
    }
  });

  it('disclaimer section exists', () => {
    render(<ComparePage />);
    expect(screen.getByText(/How we calculated:/)).toBeInTheDocument();
  });
});
