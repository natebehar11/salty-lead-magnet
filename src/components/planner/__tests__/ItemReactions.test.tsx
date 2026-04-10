/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemReactions from '../ItemReactions';
import type { SharedReaction } from '@/lib/shared-plans';

// Minimal motion/react mock — strip motion-specific props, forward ref
vi.mock('motion/react', () => {
  const React = require('react');

  function motionFactory(tag: string) {
    return React.forwardRef(function MotionMock(props: any, ref: any) {
      const {
        initial, animate, exit, transition, whileTap, whileHover, layout,
        layoutId, variants, custom, onAnimationComplete, ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref });
    });
  }

  return {
    motion: new Proxy({}, { get: (_t, prop: string) => motionFactory(prop) }),
    AnimatePresence: ({ children }: any) => children,
  };
});

function makeReaction(friendName: string, itemId: string, reaction: SharedReaction['reaction']): SharedReaction {
  return { friendName, itemId, reaction };
}

describe('ItemReactions', () => {
  const defaultProps = {
    itemId: 'item-1',
    reactions: [] as SharedReaction[],
    myReaction: null as string | null,
    hasJoined: true,
    onReact: vi.fn(),
  };

  it('renders three reaction buttons when user has joined', () => {
    render(<ItemReactions {...defaultProps} />);
    expect(screen.getByLabelText('React with love')).toBeInTheDocument();
    expect(screen.getByLabelText('React with interested')).toBeInTheDocument();
    expect(screen.getByLabelText('React with meh')).toBeInTheDocument();
  });

  it('does not render interactive buttons when user has not joined', () => {
    render(<ItemReactions {...defaultProps} hasJoined={false} />);
    expect(screen.queryByLabelText('React with love')).not.toBeInTheDocument();
  });

  it('marks selected reaction with aria-pressed', () => {
    render(<ItemReactions {...defaultProps} myReaction="love" />);
    expect(screen.getByLabelText('React with love')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('React with interested')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onReact when a button is clicked', () => {
    const onReact = vi.fn();
    render(<ItemReactions {...defaultProps} onReact={onReact} />);
    fireEvent.click(screen.getByLabelText('React with love'));
    expect(onReact).toHaveBeenCalledWith('item-1', 'love');
  });

  it('shows reaction counts next to emojis', () => {
    const reactions = [
      makeReaction('Alice', 'item-1', 'love'),
      makeReaction('Bob', 'item-1', 'love'),
      makeReaction('Charlie', 'item-1', 'interested'),
    ];
    render(<ItemReactions {...defaultProps} reactions={reactions} />);
    // Should show "2" for love and "1" for interested
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows summary text when 2+ reactions exist', () => {
    const reactions = [
      makeReaction('Alice', 'item-1', 'love'),
      makeReaction('Bob', 'item-1', 'love'),
    ];
    render(<ItemReactions {...defaultProps} reactions={reactions} />);
    expect(screen.getByText('2 people love this')).toBeInTheDocument();
  });

  it('shows generic summary when 2+ reactions but not enough love', () => {
    const reactions = [
      makeReaction('Alice', 'item-1', 'love'),
      makeReaction('Bob', 'item-1', 'interested'),
    ];
    render(<ItemReactions {...defaultProps} reactions={reactions} />);
    expect(screen.getByText('2 people reacted')).toBeInTheDocument();
  });

  it('does not show summary with fewer than 2 reactions', () => {
    const reactions = [makeReaction('Alice', 'item-1', 'love')];
    render(<ItemReactions {...defaultProps} reactions={reactions} />);
    expect(screen.queryByText(/people/)).not.toBeInTheDocument();
  });

  it('shows read-only counts for non-joined visitors when reactions exist', () => {
    const reactions = [
      makeReaction('Alice', 'item-1', 'love'),
      makeReaction('Bob', 'item-1', 'love'),
    ];
    render(<ItemReactions {...defaultProps} hasJoined={false} reactions={reactions} />);
    // Should still show count "2" in read-only mode
    expect(screen.getByText('2')).toBeInTheDocument();
    // Should not have interactive buttons
    expect(screen.queryByLabelText('React with love')).not.toBeInTheDocument();
  });

  it('shows nothing for non-joined visitors when no reactions exist', () => {
    const { container } = render(
      <ItemReactions {...defaultProps} hasJoined={false} reactions={[]} />,
    );
    // Only the wrapper divs, no emoji or text content
    expect(container.textContent).toBe('');
  });
});
