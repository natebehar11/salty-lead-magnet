/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatRecommendationCard from '../ChatRecommendationCard';
import type { RecommendationCard } from '@/types/vision-board';

// Mock motion/react to render plain HTML elements
vi.mock('motion/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const mc = (tag: string) =>
    React.forwardRef(function MockMotion(props: any, ref: any) {
      const {
        initial, animate, exit, transition, layout, layoutId,
        whileTap, whileHover, whileFocus, whileDrag, whileInView,
        ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref });
    });
  return {
    motion: { div: mc('div'), button: mc('button'), svg: mc('svg') },
    AnimatePresence: ({ children }: any) => children,
  };
});

function makeRec(overrides: Partial<RecommendationCard> = {}): RecommendationCard {
  return {
    id: 'rec-1',
    type: 'activity',
    cityName: 'San Jose',
    country: 'Costa Rica',
    name: 'Mercado Central',
    description: 'The best local food market in the city.',
    activityCategory: 'restaurant',
    ...overrides,
  };
}

describe('ChatRecommendationCard', () => {
  it('renders recommendation name and description', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec()}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.getByText('Mercado Central')).toBeInTheDocument();
    expect(screen.getByText('The best local food market in the city.')).toBeInTheDocument();
  });

  it('shows price range badge when provided', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec({ priceRange: '$$$' })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.getByText('$$$')).toBeInTheDocument();
  });

  it('does not show price range when absent', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec({ priceRange: undefined })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  it('shows days badge for city-type cards', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec({ type: 'city', days: 3 })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.getByText('3 days suggested')).toBeInTheDocument();
  });

  it('shows city name for non-city items', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec({ type: 'activity', cityName: 'Arenal' })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.getByText('in Arenal, Costa Rica')).toBeInTheDocument();
  });

  it('does not show city name for city-type items', () => {
    render(
      <ChatRecommendationCard
        recommendation={makeRec({ type: 'city', cityName: 'Arenal' })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    expect(screen.queryByText('in Arenal')).not.toBeInTheDocument();
  });

  it('calls onAdd when add button is clicked', () => {
    const onAdd = vi.fn();
    const rec = makeRec();
    render(
      <ChatRecommendationCard
        recommendation={rec}
        isOnBoard={false}
        onAdd={onAdd}
        messageId="msg-1"
      />
    );
    fireEvent.click(screen.getByLabelText('Add to board'));
    expect(onAdd).toHaveBeenCalledWith(rec);
  });

  it('does not call onAdd when already on board', () => {
    const onAdd = vi.fn();
    render(
      <ChatRecommendationCard
        recommendation={makeRec()}
        isOnBoard={true}
        onAdd={onAdd}
        messageId="msg-1"
      />
    );
    fireEvent.click(screen.getByLabelText('Saved to board'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows restaurant icon for restaurant category', () => {
    const { container } = render(
      <ChatRecommendationCard
        recommendation={makeRec({ activityCategory: 'restaurant' })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    // Restaurant emoji
    expect(container.textContent).toContain('\u{1F37D}');
  });

  it('shows city icon for city-type items without category', () => {
    const { container } = render(
      <ChatRecommendationCard
        recommendation={makeRec({ type: 'city', activityCategory: undefined })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    // City emoji
    expect(container.textContent).toContain('\u{1F3D9}');
  });

  it('shows fallback icon when no category and not city type', () => {
    const { container } = render(
      <ChatRecommendationCard
        recommendation={makeRec({ type: 'activity', activityCategory: undefined })}
        isOnBoard={false}
        onAdd={vi.fn()}
        messageId="msg-1"
      />
    );
    // Fallback pushpin emoji
    expect(container.textContent).toContain('\u{1F4CC}');
  });

  it('transitions to saved state after clicking add', () => {
    const onAdd = vi.fn();
    render(
      <ChatRecommendationCard
        recommendation={makeRec()}
        isOnBoard={false}
        onAdd={onAdd}
        messageId="msg-1"
      />
    );

    // Initially shows "Add to board"
    expect(screen.getByLabelText('Add to board')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Add to board'));

    // After click, locally transitions to saved state
    expect(screen.getByLabelText('Saved to board')).toBeInTheDocument();

    // Clicking again does nothing
    fireEvent.click(screen.getByLabelText('Saved to board'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
