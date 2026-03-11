import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlannerErrorBoundary from '../PlannerErrorBoundary';

// A component that throws based on an external flag (mutable ref allows
// changing throw behavior *before* the error boundary re-renders on Retry)
let shouldThrowGlobal = false;

function ThrowingChild() {
  if (shouldThrowGlobal) throw new Error('Test explosion');
  return <div data-testid="child-content">All good</div>;
}

describe('PlannerErrorBoundary', () => {
  beforeEach(() => {
    shouldThrowGlobal = false;
    // Suppress React's noisy error boundary console output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error', () => {
    render(
      <PlannerErrorBoundary panelName="chat">
        <ThrowingChild />
      </PlannerErrorBoundary>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    shouldThrowGlobal = true;
    render(
      <PlannerErrorBoundary panelName="chat">
        <ThrowingChild />
      </PlannerErrorBoundary>
    );
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/The chat ran into an issue/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('includes panel name in fallback message', () => {
    shouldThrowGlobal = true;
    render(
      <PlannerErrorBoundary panelName="board">
        <ThrowingChild />
      </PlannerErrorBoundary>
    );
    expect(screen.getByText(/The board ran into an issue/)).toBeInTheDocument();
  });

  it('recovers when Retry is clicked and child no longer throws', () => {
    shouldThrowGlobal = true;
    render(
      <PlannerErrorBoundary panelName="chat">
        <ThrowingChild />
      </PlannerErrorBoundary>
    );

    // In error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Flip the flag so the child won't throw on the next render,
    // then click Retry — boundary resets hasError, re-renders children successfully.
    shouldThrowGlobal = false;
    fireEvent.click(screen.getByText('Retry'));

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
