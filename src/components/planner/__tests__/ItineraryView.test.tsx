/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItineraryView from '../ItineraryView';

// ─── Mock motion/react ──────────────────────────────────────────
vi.mock('motion/react', () => {
  const React = require('react');
  const motionHandler = {
    get(_: any, prop: string) {
      return React.forwardRef(function MotionComponent(props: any, ref: any) {
        const filtered = { ...props };
        const motionProps = [
          'layout', 'initial', 'animate', 'exit', 'transition',
          'whileHover', 'whileTap', 'whileFocus', 'whileInView',
          'variants', 'drag', 'dragConstraints',
        ];
        for (const p of motionProps) delete filtered[p];
        const Tag = prop === 'create' ? 'div' : prop;
        return React.createElement(Tag, { ...filtered, ref });
      });
    },
  };
  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: any) => children,
  };
});

// ─── Mock store ──────────────────────────────────────────────────
const mockStore: Record<string, any> = {
  boardItems: [],
  beforeAfterAssignment: {},
  setCityBeforeAfter: vi.fn(),
  removeBoardItem: vi.fn(),
};

vi.mock('@/stores/planner-store', () => ({
  usePlannerStore: (selector: any) => selector(mockStore),
}));

// ─── Test retreat data ───────────────────────────────────────────
const retreat: any = {
  slug: 'test-retreat',
  title: 'Costa Rica Retreat',
  destination: 'Costa Rica',
  duration: { days: 7, nights: 6 },
};

function makeBoardItem(overrides: any) {
  return {
    id: overrides.id || `item-${overrides.name}`,
    type: overrides.type || 'activity',
    cityName: overrides.cityName || 'San José',
    country: overrides.country || 'Costa Rica',
    name: overrides.name,
    description: overrides.description || 'Test',
    addedAt: overrides.addedAt || Date.now(),
    sourceMessageId: 'msg-1',
    imageUrl: null,
    ...overrides,
  };
}

describe('ItineraryView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.boardItems = [];
    mockStore.beforeAfterAssignment = {};
  });

  it('renders retreat anchor with day range', () => {
    render(<ItineraryView retreat={retreat} />);
    // With no cities, retreat starts at day 1
    expect(screen.getByText(/Day 1–7/)).toBeTruthy();
    expect(screen.getByText('Costa Rica Retreat')).toBeTruthy();
  });

  it('shows empty state when no cities', () => {
    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText(/Add cities via the chat/)).toBeTruthy();
  });

  it('renders cities in before section by default', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Local Tour', cityName: 'San José', activityCategory: 'outdoor' }),
    ];

    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText('Before Retreat')).toBeTruthy();
    expect(screen.getByText('San José')).toBeTruthy();
    expect(screen.getByText('Local Tour')).toBeTruthy();
  });

  it('splits cities between before and after', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Arenal', cityName: 'Arenal', type: 'city', days: 3 }),
    ];
    mockStore.beforeAfterAssignment = { Arenal: 'after' };

    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText('Before Retreat')).toBeTruthy();
    expect(screen.getByText('After Retreat')).toBeTruthy();
    expect(screen.getByText('San José')).toBeTruthy();
    expect(screen.getByText('Arenal')).toBeTruthy();
  });

  it('calculates correct day ranges across sections', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Arenal', cityName: 'Arenal', type: 'city', days: 3 }),
    ];
    mockStore.beforeAfterAssignment = { Arenal: 'after' };

    render(<ItineraryView retreat={retreat} />);
    // Before: San José Day 1-2, Retreat: Day 3-9, After: Arenal Day 10-12
    expect(screen.getByText('Day 1–2')).toBeTruthy();
    expect(screen.getByText(/Day 3–9/)).toBeTruthy();
    expect(screen.getByText('Day 10–12')).toBeTruthy();
  });

  it('shows total days summary', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
    ];

    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText(/~9 days total/)).toBeTruthy();
  });

  it('calls setCityBeforeAfter when toggle button clicked', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
    ];

    render(<ItineraryView retreat={retreat} />);
    const moveBtn = screen.getByLabelText(/Move San José to after retreat/);
    fireEvent.click(moveBtn);
    expect(mockStore.setCityBeforeAfter).toHaveBeenCalledWith('San José', 'after');
  });

  it('calls removeBoardItem when activity remove button clicked', () => {
    const actItem = makeBoardItem({ id: 'act-1', name: 'Volcano Hike', cityName: 'San José', activityCategory: 'outdoor' });
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
      actItem,
    ];

    render(<ItineraryView retreat={retreat} />);
    const removeBtn = screen.getByLabelText('Remove Volcano Hike');
    fireEvent.click(removeBtn);
    expect(mockStore.removeBoardItem).toHaveBeenCalledWith('act-1');
  });

  it('shows price range on activity items', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
      makeBoardItem({ name: 'Fancy Restaurant', cityName: 'San José', type: 'restaurant', priceRange: '$$$' }),
    ];

    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText('$$$')).toBeTruthy();
  });

  it('shows helpful tip when only before section exists', () => {
    mockStore.boardItems = [
      makeBoardItem({ name: 'San José', cityName: 'San José', type: 'city', days: 2 }),
    ];

    render(<ItineraryView retreat={retreat} />);
    expect(screen.getByText(/Move a city to "after"/)).toBeTruthy();
  });
});
