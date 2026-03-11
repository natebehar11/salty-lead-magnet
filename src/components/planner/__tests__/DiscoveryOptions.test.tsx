/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiscoveryOptions from '../DiscoveryOptions';
import type { DiscoveryOption } from '@/lib/discovery-messages';

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

// Also mock motion/react (what the component actually imports)
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

const SINGLE_OPTIONS: DiscoveryOption[] = [
  { label: 'Explore Morocco', emoji: '🗺', value: 'explore-same' },
  { label: 'Visit nearby', emoji: '✈️', value: 'nearby-country' },
  { label: 'I have places', emoji: '📍', value: 'specific-places' },
];

const MULTI_OPTIONS: DiscoveryOption[] = [
  { label: 'Restaurants', emoji: '🍽', value: 'restaurants', description: 'Local eats' },
  { label: 'Beaches', emoji: '🏄', value: 'beaches', description: 'Coastline' },
  { label: 'Nightlife', emoji: '🌙', value: 'nightlife', description: 'Bars, clubs' },
];

const REENGAGEMENT_OPTIONS: DiscoveryOption[] = [
  { label: 'Try another location', emoji: '🗺', value: 'restart-location' },
  { label: 'New discovery', emoji: '🔄', value: 'restart-full' },
];

// ---------------------------------------------------------------------------
// Single-select mode
// ---------------------------------------------------------------------------

describe('DiscoveryOptions — single mode', () => {
  it('renders all options', () => {
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText('Explore Morocco')).toBeInTheDocument();
    expect(screen.getByLabelText('Visit nearby')).toBeInTheDocument();
    expect(screen.getByLabelText('I have places')).toBeInTheDocument();
  });

  it('calls onSelect when an option is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={onSelect}
        allowCustom={false}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('Explore Morocco'));
    expect(onSelect).toHaveBeenCalledWith('explore-same');
  });

  it('shows "Something else" button when allowCustom is true', () => {
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={vi.fn()}
        allowCustom={true}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText('Type something else')).toBeInTheDocument();
  });

  it('does not show "Something else" when allowCustom is false', () => {
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    expect(screen.queryByLabelText('Type something else')).not.toBeInTheDocument();
  });

  it('expands text input when expandable value is clicked', () => {
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={vi.fn()}
        expandableValues={['specific-places']}
        allowCustom={false}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('I have places'));
    expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument();
  });

  it('submits text input on Enter', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={onSelect}
        expandableValues={['specific-places']}
        allowCustom={false}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('I have places'));
    const input = screen.getByPlaceholderText('Type your answer...');
    fireEvent.change(input, { target: { value: 'Marrakech and Fez' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('Marrakech and Fez');
  });

  it('submits text input on Go button click', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={onSelect}
        allowCustom={true}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('Type something else'));
    const input = screen.getByPlaceholderText('Type your answer...');
    fireEvent.change(input, { target: { value: 'custom answer' } });
    fireEvent.click(screen.getByLabelText('Submit custom answer'));
    expect(onSelect).toHaveBeenCalledWith('custom answer');
  });

  it('does not submit empty text input', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={onSelect}
        allowCustom={true}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('Type something else'));
    const input = screen.getByPlaceholderText('Type your answer...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('disables all buttons when disabled is true', () => {
    render(
      <DiscoveryOptions
        options={SINGLE_OPTIONS}
        mode="single"
        onSelect={vi.fn()}
        allowCustom={true}
        disabled={true}
      />,
    );
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});

// ---------------------------------------------------------------------------
// Multi-select mode
// ---------------------------------------------------------------------------

describe('DiscoveryOptions — multi mode', () => {
  it('renders all options', () => {
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText('Restaurants')).toBeInTheDocument();
    expect(screen.getByLabelText('Beaches')).toBeInTheDocument();
    expect(screen.getByLabelText('Nightlife')).toBeInTheDocument();
  });

  it('toggles selection on click', () => {
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    const btn = screen.getByLabelText('Restaurants');
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows "Find my spots" after selecting one option', () => {
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    expect(screen.queryByLabelText('Find my spots')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Restaurants'));
    expect(screen.getByLabelText('Find my spots')).toBeInTheDocument();
  });

  it('calls onSubmit with selected values', () => {
    const onSubmit = vi.fn();
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={onSubmit}
        allowCustom={false}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('Restaurants'));
    fireEvent.click(screen.getByLabelText('Beaches'));
    fireEvent.click(screen.getByLabelText('Find my spots'));

    expect(onSubmit).toHaveBeenCalledOnce();
    const calledWith = onSubmit.mock.calls[0][0] as string[];
    expect(calledWith).toContain('restaurants');
    expect(calledWith).toContain('beaches');
    expect(calledWith).not.toContain('nightlife');
  });

  it('shows "Show me everything" when showSelectAll is true', () => {
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={vi.fn()}
        allowCustom={false}
        disabled={false}
        showSelectAll={true}
      />,
    );
    expect(screen.getByLabelText('Show me everything')).toBeInTheDocument();
  });

  it('"Show me everything" selects all and auto-submits', () => {
    const onSubmit = vi.fn();
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={onSubmit}
        allowCustom={false}
        disabled={false}
        showSelectAll={true}
      />,
    );
    fireEvent.click(screen.getByLabelText('Show me everything'));

    expect(onSubmit).toHaveBeenCalledOnce();
    const calledWith = onSubmit.mock.calls[0][0] as string[];
    expect(calledWith).toHaveLength(3);
    expect(calledWith).toContain('restaurants');
    expect(calledWith).toContain('beaches');
    expect(calledWith).toContain('nightlife');
  });

  it('disables all buttons when disabled', () => {
    render(
      <DiscoveryOptions
        options={MULTI_OPTIONS}
        mode="multi"
        onSelect={vi.fn()}
        onSubmit={vi.fn()}
        allowCustom={false}
        disabled={true}
        showSelectAll={true}
      />,
    );
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});

// ---------------------------------------------------------------------------
// Re-engagement mode
// ---------------------------------------------------------------------------

describe('DiscoveryOptions — reengagement mode', () => {
  it('renders compact chips', () => {
    render(
      <DiscoveryOptions
        options={REENGAGEMENT_OPTIONS}
        mode="reengagement"
        onSelect={vi.fn()}
        allowCustom={false}
        disabled={false}
      />,
    );
    expect(screen.getByLabelText('Try another location')).toBeInTheDocument();
    expect(screen.getByLabelText('New discovery')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <DiscoveryOptions
        options={REENGAGEMENT_OPTIONS}
        mode="reengagement"
        onSelect={onSelect}
        allowCustom={false}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByLabelText('Try another location'));
    expect(onSelect).toHaveBeenCalledWith('restart-location');
  });

  it('disables when disabled prop is true', () => {
    render(
      <DiscoveryOptions
        options={REENGAGEMENT_OPTIONS}
        mode="reengagement"
        onSelect={vi.fn()}
        allowCustom={false}
        disabled={true}
      />,
    );
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });
});
