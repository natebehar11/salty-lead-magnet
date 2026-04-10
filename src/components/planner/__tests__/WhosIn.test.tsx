/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhosIn from '../WhosIn';
import type { SharedPlanFriend } from '@/lib/shared-plans';

// Minimal motion/react mock
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

function makeFriend(
  name: string,
  status: SharedPlanFriend['status'],
  originCity?: string,
): SharedPlanFriend {
  return {
    name,
    status,
    originCity,
    joinedAt: new Date().toISOString(),
  };
}

describe('WhosIn', () => {
  it('renders the organizer with initials', () => {
    render(<WhosIn creatorName="Jane Doe" friends={[]} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Organizer')).toBeInTheDocument();
  });

  it('shows empty state when no friends have joined', () => {
    render(<WhosIn creatorName="Nate" friends={[]} />);
    expect(screen.getByText(/No one else has joined yet/)).toBeInTheDocument();
  });

  it('renders friends sorted by status: in → interested → maybe → out', () => {
    const friends = [
      makeFriend('Out Person', 'out'),
      makeFriend('In Person', 'in'),
      makeFriend('Maybe Person', 'maybe'),
      makeFriend('Interested Person', 'interested'),
    ];

    render(<WhosIn creatorName="Creator" friends={friends} />);

    const names = screen.getAllByText(/Person/).map((el) => el.textContent);
    expect(names).toEqual([
      'In Person',
      'Interested Person',
      'Maybe Person',
      'Out Person',
    ]);
  });

  it('shows confirmed count in header', () => {
    const friends = [
      makeFriend('Alice', 'in'),
      makeFriend('Bob', 'interested'),
      makeFriend('Charlie', 'maybe'),
    ];

    render(<WhosIn creatorName="Creator" friends={friends} />);
    // Creator + Alice = 2 confirmed, 4 total
    expect(screen.getByText('2 of 4 confirmed')).toBeInTheDocument();
  });

  it('renders progress bar when friends exist', () => {
    const friends = [makeFriend('Alice', 'in')];
    render(<WhosIn creatorName="Creator" friends={friends} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('does not render progress bar when no friends', () => {
    render(<WhosIn creatorName="Creator" friends={[]} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows origin city when provided', () => {
    const friends = [makeFriend('Alice', 'in', 'Toronto')];
    render(<WhosIn creatorName="Creator" friends={friends} />);
    expect(screen.getByText('Toronto')).toBeInTheDocument();
  });

  it('does not show origin city line when not provided', () => {
    const friends = [makeFriend('Alice', 'in')];
    render(<WhosIn creatorName="Creator" friends={friends} />);
    expect(screen.queryByText('Toronto')).not.toBeInTheDocument();
  });

  it('renders status labels for each friend', () => {
    const friends = [
      makeFriend('Alice', 'in'),
      makeFriend('Bob', 'maybe'),
    ];
    render(<WhosIn creatorName="Creator" friends={friends} />);
    // "I'm in!" appears for organizer badge + Alice's label = at least 2
    expect(screen.getAllByText("I'm in!").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Maybe')).toBeInTheDocument();
  });

  it('shows legend with counts when friends exist', () => {
    const friends = [
      makeFriend('Alice', 'in'),
      makeFriend('Bob', 'interested'),
    ];
    render(<WhosIn creatorName="Creator" friends={friends} />);
    // Legend should show: "I'm in! (2)" (creator + Alice) and "Interested (1)"
    expect(screen.getByText("I'm in! (2)")).toBeInTheDocument();
    expect(screen.getByText('Interested (1)')).toBeInTheDocument();
  });

  it('extracts single initial from single-word name', () => {
    render(<WhosIn creatorName="Madonna" friends={[]} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});
