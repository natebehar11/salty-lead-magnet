/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VisionBoard from '../VisionBoard';
import { usePlannerStore } from '@/stores/planner-store';
import type { BoardItem, TopLevelBoardItem } from '@/types/vision-board';
import type { Retreat } from '@/types';

// Mock motion/react
vi.mock('motion/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const mc = (tag: string) =>
    React.forwardRef(function MockMotion(props: any, ref: any) {
      const {
        initial, animate, exit, transition, layout, layoutId,
        whileTap, whileHover, whileFocus, whileDrag, whileInView,
        variants, values, onReorder, axis,
        as: _as,
        ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref });
    });
  return {
    motion: { div: mc('div'), button: mc('button'), svg: mc('svg') },
    AnimatePresence: ({ children }: any) => children,
    Reorder: {
      Group: mc('div'),
      Item: mc('div'),
    },
  };
});

vi.mock('@/stores/planner-store', () => ({
  usePlannerStore: vi.fn(),
}));

// Mock child components to isolate VisionBoard behavior
vi.mock('../VisionBoardCountrySection', () => ({
  default: ({ group }: any) => (
    <div data-testid={`country-${group.country}`}>{group.country}</div>
  ),
}));

vi.mock('../RetreatCard', () => ({
  default: ({ retreat }: any) => (
    <div data-testid="retreat-card">{retreat.title}</div>
  ),
}));

vi.mock('../VisionBoardEmpty', () => ({
  default: ({ onSwitchToChat }: any) => (
    <div data-testid="empty-board">
      <button onClick={onSwitchToChat}>Start Chatting</button>
    </div>
  ),
}));

vi.mock('../ItineraryView', () => ({
  default: ({ retreat }: any) => (
    <div data-testid="itinerary-view">{retreat.title} Itinerary</div>
  ),
}));

vi.mock('../TripCostEstimator', () => ({
  default: ({ retreat }: any) => (
    <div data-testid="trip-cost-estimator">{retreat.title} Cost</div>
  ),
}));

const mockRetreat = {
  slug: 'costa-rica-fitness-retreat',
  destination: 'Costa Rica',
  title: 'Costa Rica Fitness',
  subtitle: 'Test',
  tagline: 'Test tagline',
  status: 'available' as const,
  startDate: '2026-03-15',
  endDate: '2026-03-22',
  duration: { days: 7, nights: 6 },
  locations: [],
  roomTiers: [],
  deposit: 500,
  currency: 'USD',
  lowestPrice: 2500,
  saltyMeter: { adventure: 8, culture: 6, party: 5, sweat: 9, rest: 4, groupSize: { min: 10, max: 20 } },
  heroImage: '',
  cardImage: '',
  experience: { paragraphs: [], forYouIf: [] },
  activities: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  coaches: [],
  spotsRemaining: 10,
  testimonialIds: [],
  rating: { value: 4.8, count: 25 },
  faq: [],
  seoTitle: '',
  metaDescription: '',
  airport: { name: 'SJO', code: 'SJO' },
  visa: 'Not required',
} satisfies Retreat;

const mockBoardItem: BoardItem = {
  id: 'item-1',
  type: 'activity',
  cityName: 'San Jose',
  country: 'Costa Rica',
  name: 'Central Market Tour',
  description: 'Explore the historic market.',
  activityCategory: 'landmark',
  addedAt: Date.now(),
  sourceMessageId: 'msg-1',
};

const mockCityItem: BoardItem = {
  id: 'city-1',
  type: 'city',
  cityName: 'San Jose',
  country: 'Costa Rica',
  name: 'San Jose',
  description: 'Capital city of Costa Rica.',
  days: 2,
  addedAt: Date.now(),
  sourceMessageId: 'msg-1',
};

function setupStore(overrides: Record<string, unknown> = {}) {
  const defaults = {
    boardItems: [] as BoardItem[],
    topLevelOrder: [{ kind: 'retreat' as const }] as TopLevelBoardItem[],
    cityOrderByCountry: {} as Record<string, string[]>,
    boardViewMode: 'dream' as const,
    setBoardViewMode: vi.fn(),
    beforeAfterAssignment: {} as Record<string, string>,
    removeBoardItem: vi.fn(),
    clearBoardItems: vi.fn(),
    updateBoardItemImage: vi.fn(),
    setMobileActiveTab: vi.fn(),
    setTopLevelOrder: vi.fn(),
    ...overrides,
  };
  (usePlannerStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (s: typeof defaults) => unknown) => selector(defaults)
  );
  return defaults;
}

describe('VisionBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no board items', () => {
    setupStore({ boardItems: [] });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    expect(screen.getByTestId('empty-board')).toBeInTheDocument();
  });

  it('renders header with item and city counts when items exist', () => {
    setupStore({
      boardItems: [mockCityItem, mockBoardItem],
      topLevelOrder: [
        { kind: 'retreat' },
        { kind: 'country', country: 'Costa Rica' },
      ],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    expect(screen.getByText('Your Trip Board')).toBeInTheDocument();
    // 1 non-city activity, 1 unique city
    expect(screen.getByText(/1 city/)).toBeInTheDocument();
    expect(screen.getByText(/1 spot/)).toBeInTheDocument();
  });

  it('pluralizes counts correctly for multiple items', () => {
    const item2: BoardItem = {
      ...mockBoardItem,
      id: 'item-2',
      name: 'Volcano Hike',
      cityName: 'Arenal',
      country: 'Costa Rica',
    };
    const city2: BoardItem = {
      ...mockCityItem,
      id: 'city-2',
      cityName: 'Arenal',
      name: 'Arenal',
    };
    setupStore({
      boardItems: [mockCityItem, mockBoardItem, city2, item2],
      topLevelOrder: [
        { kind: 'retreat' },
        { kind: 'country', country: 'Costa Rica' },
      ],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    expect(screen.getByText(/2 cities/)).toBeInTheDocument();
    expect(screen.getByText(/2 spots/)).toBeInTheDocument();
  });

  it('shows total days including retreat duration', () => {
    setupStore({
      boardItems: [mockCityItem, mockBoardItem],
      topLevelOrder: [
        { kind: 'retreat' },
        { kind: 'country', country: 'Costa Rica' },
      ],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    // mockCityItem has days=2, retreat has duration.days=7, total = 9
    expect(screen.getByText(/~9 days/)).toBeInTheDocument();
  });

  it('shows clear button and handles confirm/cancel flow', () => {
    setupStore({
      boardItems: [mockBoardItem],
      topLevelOrder: [{ kind: 'retreat' }],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );

    // Click Clear
    fireEvent.click(screen.getByLabelText('Clear all items from board'));

    // Should show Confirm + Cancel
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    // Click Cancel — should show Clear again
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByLabelText('Clear all items from board')).toBeInTheDocument();
  });

  it('calls clearBoardItems on confirm', () => {
    const clearFn = vi.fn();
    setupStore({
      boardItems: [mockBoardItem],
      topLevelOrder: [{ kind: 'retreat' }],
      clearBoardItems: clearFn,
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );

    fireEvent.click(screen.getByLabelText('Clear all items from board'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(clearFn).toHaveBeenCalledOnce();
  });

  it('shows share and save buttons when items exist', () => {
    setupStore({
      boardItems: [mockBoardItem],
      topLevelOrder: [{ kind: 'retreat' }],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    expect(screen.getByLabelText('Share trip board with friends')).toBeInTheDocument();
    expect(screen.getByLabelText('Save trip board to email')).toBeInTheDocument();
  });

  it('fires onShareClick and onEmailClick callbacks', () => {
    const onShare = vi.fn();
    const onEmail = vi.fn();
    setupStore({
      boardItems: [mockBoardItem],
      topLevelOrder: [{ kind: 'retreat' }],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={onShare} onEmailClick={onEmail} />
    );

    fireEvent.click(screen.getByLabelText('Share trip board with friends'));
    expect(onShare).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByLabelText('Save trip board to email'));
    expect(onEmail).toHaveBeenCalledOnce();
  });

  it('renders retreat card and country sections', () => {
    setupStore({
      boardItems: [mockCityItem, mockBoardItem],
      topLevelOrder: [
        { kind: 'retreat' },
        { kind: 'country', country: 'Costa Rica' },
      ],
    });
    render(
      <VisionBoard retreat={mockRetreat} onShareClick={vi.fn()} onEmailClick={vi.fn()} />
    );
    expect(screen.getByTestId('retreat-card')).toBeInTheDocument();
    expect(screen.getByTestId('country-Costa Rica')).toBeInTheDocument();
  });
});
