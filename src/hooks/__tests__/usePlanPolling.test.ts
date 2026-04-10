import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlanPolling } from '../usePlanPolling';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makePlanResponse(id = 'abc123') {
  return {
    ok: true,
    json: async () => ({ plan: { id, version: 2, friends: [], reactions: [] } }),
  };
}

describe('usePlanPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(makePlanResponse());
    // Default: tab visible
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not poll when disabled', async () => {
    renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: false, onUpdate: vi.fn() }),
    );

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('polls every 15s when enabled and tab visible', async () => {
    const onUpdate = vi.fn();
    renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: true, onUpdate }),
    );

    // No fetch at t=0 (interval starts at 15s)
    expect(mockFetch).not.toHaveBeenCalled();

    // Advance to first tick
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/plans?id=abc');
    expect(onUpdate).toHaveBeenCalledTimes(1);

    // Second tick
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('stops polling when tab becomes hidden', async () => {
    renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: true, onUpdate: vi.fn() }),
    );

    // First tick fires
    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Hide tab
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Advance time — should NOT poll
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fetches immediately when tab becomes visible again', async () => {
    renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: true, onUpdate: vi.fn() }),
    );

    // Hide tab
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Show tab again — should fetch immediately
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', async () => {
    const { unmount } = renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: true, onUpdate: vi.fn() }),
    );

    unmount();

    // No polling after unmount
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('silently handles fetch errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const onUpdate = vi.fn();

    renderHook(() =>
      usePlanPolling({ planId: 'abc', enabled: true, onUpdate }),
    );

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    // Should not throw, onUpdate should not be called
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
