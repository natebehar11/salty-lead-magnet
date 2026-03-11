/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlannerChatPanel from '../PlannerChatPanel';

// ─── Mock scrollIntoView (not available in JSDOM) ────────────────
Element.prototype.scrollIntoView = vi.fn();

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

// Also mock motion/react (used by DiscoveryOptions)
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
  messages: [],
  boardItems: [],
  userProfile: null,
  addMessage: vi.fn(),
  addBoardItem: vi.fn(),
  setMobileActiveTab: vi.fn(),
  hydrateProfile: vi.fn(),
  // Discovery fields
  discoveryStage: 'greeting',
  discoveryLocationChoice: null,
  discoveryVibeChoice: null,
  discoveryTypeChoices: null,
  discoveryIsSurprise: false,
  setDiscoveryStage: vi.fn(),
  setDiscoveryLocationChoice: vi.fn(),
  setDiscoveryVibeChoice: vi.fn(),
  setDiscoveryTypeChoices: vi.fn(),
  setDiscoveryIsSurprise: vi.fn(),
  completeDiscovery: vi.fn(),
  restartDiscoveryAtLocation: vi.fn(),
  resetDiscovery: vi.fn(),
};

vi.mock('@/stores/planner-store', () => ({
  usePlannerStore: Object.assign(
    (selector: any) => selector(mockStore),
    {
      getState: () => mockStore,
    }
  ),
}));

// ─── Mock ChatRecommendationCard ─────────────────────────────────
vi.mock('../ChatRecommendationCard', () => ({
  default: ({ recommendation }: any) => (
    <div data-testid={`rec-${recommendation.id}`}>{recommendation.name}</div>
  ),
}));

// ─── Test retreat data ───────────────────────────────────────────
const retreat: any = {
  slug: 'costa-rica-fitness-retreat',
  destination: 'Costa Rica',
  title: 'Surf Sweat Flow v3',
  saltyMeter: {
    adventure: 7,
    culture: 6,
    party: 5,
    sweat: 7,
    rest: 8,
    groupSize: { min: 25, max: 35 },
  },
};

const retreatNoMeter: any = {
  slug: 'test-retreat',
  destination: 'Unknown',
  title: 'Test Retreat',
  saltyMeter: null,
};

describe('PlannerChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.messages = [];
    mockStore.boardItems = [];
    mockStore.userProfile = null;
    mockStore.discoveryStage = 'greeting';
    mockStore.discoveryLocationChoice = null;
    mockStore.discoveryVibeChoice = null;
    mockStore.discoveryTypeChoices = null;
    mockStore.discoveryIsSurprise = false;
    // Mock fetch in case it's called
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'Hello!', recommendations: [] }),
    });
  });

  describe('Discovery flow initiation', () => {
    it('sends a discovery greeting message on first render', () => {
      render(<PlannerChatPanel retreat={retreat} />);
      // Should add an assistant message with the location question
      expect(mockStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('Surf Sweat Flow v3'),
        })
      );
    });

    it('sets discovery stage to location after greeting', () => {
      render(<PlannerChatPanel retreat={retreat} />);
      expect(mockStore.setDiscoveryStage).toHaveBeenCalledWith('location');
    });

    it('does not initiate discovery when messages already exist', () => {
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      mockStore.discoveryStage = 'complete';
      render(<PlannerChatPanel retreat={retreat} />);
      // addMessage should not be called for auto-greeting
      expect(mockStore.addMessage).not.toHaveBeenCalled();
    });
  });

  describe('Discovery options rendering', () => {
    it('shows location options when stage is location', () => {
      mockStore.discoveryStage = 'location';
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'Where do you want to explore?', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByLabelText('Explore more of Costa Rica')).toBeTruthy();
      expect(screen.getByLabelText('Visit a nearby country')).toBeTruthy();
      expect(screen.getByLabelText('I have places in mind')).toBeTruthy();
    });

    it('shows vibe options when stage is vibe', () => {
      mockStore.discoveryStage = 'vibe';
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'What vibe?', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByLabelText('Chill & relax')).toBeTruthy();
      expect(screen.getByLabelText('Explore & sightsee')).toBeTruthy();
      expect(screen.getByLabelText('Adventure & adrenaline')).toBeTruthy();
    });

    it('shows types options with multi-select when stage is types', () => {
      mockStore.discoveryStage = 'types';
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'What kind of recs?', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByLabelText('Restaurants & Food')).toBeTruthy();
      expect(screen.getByLabelText('Beaches & Surf')).toBeTruthy();
      expect(screen.getByLabelText('Show me everything')).toBeTruthy();
    });

    it('does not show discovery options when stage is complete', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Here are your recs!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.queryByLabelText('Explore more of Costa Rica')).toBeNull();
      expect(screen.queryByLabelText('Chill & relax')).toBeNull();
    });
  });

  describe('Free-type bypass during discovery', () => {
    it('shows skip-ahead placeholder during discovery', () => {
      mockStore.discoveryStage = 'location';
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'Where do you want to explore?', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByPlaceholderText('Or type anything to skip ahead...')).toBeTruthy();
    });

    it('shows normal placeholder when discovery is complete', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Here are your recs!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByPlaceholderText('Ask about places, food, activities...')).toBeTruthy();
    });
  });

  describe('Feeling chips (post-discovery)', () => {
    /**
     * Feeling/follow-up chips only show when discoveryStage === 'complete'
     * and there are visible messages. We set up the store accordingly.
     */

    it('renders feeling chips after discovery complete with visible messages', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      // Bottom-bar feeling chips should be visible
      expect(screen.getByText('I want adventure')).toBeTruthy();
      expect(screen.getByText('Cultural deep dive')).toBeTruthy();
    });

    it('does not render feeling chips during discovery', () => {
      mockStore.discoveryStage = 'location';
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'Where do you want to explore?', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      // Feeling chips should NOT be present
      expect(screen.queryByText('I want adventure')).toBeNull();
      expect(screen.queryByText('Cultural deep dive')).toBeNull();
    });

    it('has proper aria-labels on feeling chip buttons', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      // Bottom-bar chips are sliced to 4, so check the first two (always present)
      expect(screen.getByLabelText("I want: Where's the party?")).toBeTruthy();
      expect(screen.getByLabelText('I want: Cultural deep dive')).toBeTruthy();
    });

    it('sorts chips by retreat complement (lowest meter score first)', () => {
      // Costa Rica retreat: party=5 (lowest), culture=6, adventure=7, sweat=7, rest=8 (highest)
      // Bottom-bar shows only first 4 of 5 sorted chips
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      const buttons = screen.getAllByRole('button').filter(
        (btn) => btn.getAttribute('aria-label')?.startsWith('I want:')
      );
      // First chip should be party (score 5, lowest)
      expect(buttons[0].textContent).toContain("Where's the party?");
      // Second chip should be culture (score 6)
      expect(buttons[1].textContent).toContain('Cultural deep dive');
      // Only 4 chips shown (rest=8 is cut off)
      expect(buttons).toHaveLength(4);
    });

    it('renders unsorted chips when retreat has no saltyMeter', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreatNoMeter} />);
      const buttons = screen.getAllByRole('button').filter(
        (btn) => btn.getAttribute('aria-label')?.startsWith('I want:')
      );
      // Default order, but only 4 of 5 shown
      expect(buttons[0].textContent).toContain('I want adventure');
      expect(buttons).toHaveLength(4);
    });

    it('sends emotion-driven prompt when feeling chip clicked', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 1 },
      ];
      render(<PlannerChatPanel retreat={retreat} />);
      const adventureChip = screen.getByText('I want adventure').closest('button')!;
      fireEvent.click(adventureChip);

      // Should have added a user message with the full emotion prompt
      expect(mockStore.addMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('I want adventure — suggest exciting'),
        })
      );
    });
  });

  describe('Follow-up chips', () => {
    it('shows follow-up chips when board has 3+ items and discovery complete', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.boardItems = [
        { id: '1', name: 'Item 1', cityName: 'A', type: 'activity' },
        { id: '2', name: 'Item 2', cityName: 'A', type: 'activity' },
        { id: '3', name: 'Item 3', cityName: 'A', type: 'activity' },
      ];
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 2 },
      ];

      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByText('Best restaurants nearby')).toBeTruthy();
      expect(screen.getByText('Hidden gems only locals know')).toBeTruthy();
      expect(screen.getByText('Where to stay before flying in')).toBeTruthy();
      expect(screen.getByText('Plan my full before & after trip')).toBeTruthy();
    });

    it('does not show follow-up chips during discovery even with 3+ board items', () => {
      mockStore.discoveryStage = 'location';
      mockStore.boardItems = [
        { id: '1', name: 'Item 1', cityName: 'A', type: 'activity' },
        { id: '2', name: 'Item 2', cityName: 'A', type: 'activity' },
        { id: '3', name: 'Item 3', cityName: 'A', type: 'activity' },
      ];
      mockStore.messages = [
        { id: 'd1', role: 'assistant', content: 'Where to explore?', timestamp: 1 },
      ];

      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.queryByText('Best restaurants nearby')).toBeNull();
    });
  });

  describe('Chip transitions', () => {
    it('shows feeling chips in bottom section when 1-2 board items', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.boardItems = [
        { id: '1', name: 'Item 1', cityName: 'A', type: 'activity' },
        { id: '2', name: 'Item 2', cityName: 'A', type: 'activity' },
      ];
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 2 },
      ];

      render(<PlannerChatPanel retreat={retreat} />);
      expect(screen.getByText('I want adventure')).toBeTruthy();
    });

    it('switches to follow-up chips at exactly 3 board items', () => {
      mockStore.discoveryStage = 'complete';
      mockStore.boardItems = [
        { id: '1', name: 'Item 1', cityName: 'A', type: 'activity' },
        { id: '2', name: 'Item 2', cityName: 'A', type: 'activity' },
        { id: '3', name: 'Item 3', cityName: 'A', type: 'activity' },
      ];
      mockStore.messages = [
        { id: 'a1', role: 'assistant', content: 'Hello!', timestamp: 2 },
      ];

      render(<PlannerChatPanel retreat={retreat} />);
      // Feeling chips should be gone
      expect(screen.queryByText('I want adventure')).toBeNull();
      // Follow-up chips should be present
      expect(screen.getByText('Best restaurants nearby')).toBeTruthy();
    });
  });
});
