/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeadCaptureModal from '../LeadCaptureModal';
import { usePlannerStore } from '@/stores/planner-store';
import type { Retreat } from '@/types';
import type { BoardItem } from '@/types/vision-board';

// Mock motion/react
vi.mock('motion/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const mc = (tag: string) =>
    React.forwardRef(function MockMotion(props: any, ref: any) {
      const {
        initial, animate, exit, transition, layout, layoutId,
        whileTap, whileHover,
        ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref });
    });
  return {
    motion: { div: mc('div'), button: mc('button') },
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock the store — need both selector pattern and getState()
vi.mock('@/stores/planner-store', () => {
  const fn: any = vi.fn();
  fn.getState = vi.fn();
  return { usePlannerStore: fn };
});

vi.mock('@/components/shared/ShareButton', () => ({
  default: ({ url }: any) => <div data-testid="share-button">{url}</div>,
}));

vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...actual,
    formatDateRange: (start: string, end: string) => `${start} - ${end}`,
  };
});

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

function setupStore(overrides: Record<string, unknown> = {}) {
  const defaults = {
    boardItems: [mockBoardItem] as BoardItem[],
    formSubmitted: false,
    creatorName: '',
    creatorEmail: '',
    sharedPlanUrl: null as string | null,
    setCreatorName: vi.fn(),
    setCreatorEmail: vi.fn(),
    setFormSubmitted: vi.fn(),
    setHasShared: vi.fn(),
    setSharedPlanUrl: vi.fn(),
    topLevelOrder: [{ kind: 'retreat' as const }],
    cityOrderByCountry: {},
    ...overrides,
  };
  (usePlannerStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (s: typeof defaults) => unknown) => selector(defaults)
  );
  (usePlannerStore as any).getState.mockReturnValue(defaults);
  return defaults;
}

describe('LeadCaptureModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    setupStore();
    const { container } = render(
      <LeadCaptureModal isOpen={false} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders share mode form with correct title', () => {
    setupStore();
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );
    expect(screen.getByText('Share Your Trip Board')).toBeInTheDocument();
    expect(screen.getByText(/shareable link/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(555) 123-4567')).toBeInTheDocument();
  });

  it('renders email mode form with correct title', () => {
    setupStore();
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="email" />
    );
    expect(screen.getByText('Save Your Trip Board')).toBeInTheDocument();
    expect(screen.getByText(/save your board/i)).toBeInTheDocument();
    // WhatsApp field should not appear in email mode
    expect(screen.queryByPlaceholderText('WhatsApp number (optional)')).not.toBeInTheDocument();
  });

  it('disables submit button when name and email are empty', () => {
    setupStore({ creatorName: '', creatorEmail: '' });
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );
    const submitBtn = screen.getByText('Get My Shareable Link');
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when name and email are provided', () => {
    setupStore({ creatorName: 'Test User', creatorEmail: 'test@example.com' });
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );
    const submitBtn = screen.getByText('Get My Shareable Link');
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows correct submit text for email mode', () => {
    setupStore({ creatorName: 'Test', creatorEmail: 'test@example.com' });
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="email" />
    );
    expect(screen.getByText('Save My Board')).toBeInTheDocument();
  });

  it('calls lead capture API on share mode submit', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ plan: { id: 'plan-abc' } }) });
    vi.stubGlobal('fetch', mockFetch);

    const store = setupStore({
      creatorName: 'Test User',
      creatorEmail: 'test@example.com',
    });

    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );

    fireEvent.click(screen.getByText('Get My Shareable Link'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // First call: lead capture
    expect(mockFetch.mock.calls[0][0]).toBe('/api/leads/capture');
    const leadBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(leadBody.firstName).toBe('Test User');
    expect(leadBody.email).toBe('test@example.com');
    expect(leadBody.source).toBe('planner-v2-share');

    // Second call: create plan
    expect(mockFetch.mock.calls[1][0]).toBe('/api/plans');
    const planBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(planBody.version).toBe(2);
    expect(planBody.creatorName).toBe('Test User');
    expect(planBody.retreatSlug).toBe('costa-rica-fitness-retreat');

    // Store actions called
    expect(store.setFormSubmitted).toHaveBeenCalledWith(true);
    expect(store.setHasShared).toHaveBeenCalledWith(true);
    expect(store.setSharedPlanUrl).toHaveBeenCalledWith(
      expect.stringContaining('/plan/plan-abc')
    );
  });

  it('calls lead capture API on email mode submit', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', mockFetch);

    const store = setupStore({
      creatorName: 'Test User',
      creatorEmail: 'test@example.com',
    });

    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="email" />
    );

    fireEvent.click(screen.getByText('Save My Board'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const leadBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(leadBody.source).toBe('planner-v2-email');
    expect(leadBody.intentAction).toBe('email_board');
    expect(store.setFormSubmitted).toHaveBeenCalledWith(true);
  });

  it('shows error message on API failure', async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    setupStore({
      creatorName: 'Test User',
      creatorEmail: 'test@example.com',
    });

    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );

    fireEvent.click(screen.getByText('Get My Shareable Link'));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders share success state with plan URL', () => {
    setupStore({
      formSubmitted: true,
      sharedPlanUrl: 'http://localhost:3000/plan/abc123',
    });
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="share" />
    );
    expect(screen.getByText('Your Board is Ready!')).toBeInTheDocument();
    // URL appears in both the copy field and share button mock
    expect(screen.getAllByText('http://localhost:3000/plan/abc123')).toHaveLength(2);
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders email success state with mode switch option', () => {
    setupStore({ formSubmitted: true });
    render(
      <LeadCaptureModal isOpen={true} onClose={vi.fn()} retreat={mockRetreat} mode="email" />
    );
    expect(screen.getByText('Saved!')).toBeInTheDocument();
    expect(screen.getByText('Share with Friends')).toBeInTheDocument();
    expect(screen.getByText('Keep planning')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    setupStore();
    render(
      <LeadCaptureModal isOpen={true} onClose={onClose} retreat={mockRetreat} mode="share" />
    );
    // Close button is the X icon in top-right
    const closeButtons = screen.getAllByRole('button');
    // First button in the modal is the close button
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    setupStore();
    const { container } = render(
      <LeadCaptureModal isOpen={true} onClose={onClose} retreat={mockRetreat} mode="share" />
    );
    // Backdrop is the first div with onClick={onClose}
    const backdrop = container.querySelector('.backdrop-blur-sm');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
