'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { SharedPlanAny } from '@/lib/shared-plans';

const POLL_INTERVAL_MS = 15_000;

interface UsePlanPollingOptions {
  /** The plan ID to poll */
  planId: string;
  /** Whether the initial fetch has completed and a plan exists */
  enabled: boolean;
  /** Callback with the refreshed plan data */
  onUpdate: (plan: SharedPlanAny) => void;
}

/**
 * Polls `/api/plans?id=…` every 15 seconds while the browser tab is visible.
 * Pauses automatically when the tab is hidden and resumes when it becomes visible.
 */
export function usePlanPolling({ planId, enabled, onUpdate }: UsePlanPollingOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch(`/api/plans?id=${planId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.plan) onUpdateRef.current(data.plan);
    } catch {
      // Silent — background polling shouldn't disrupt the UI
    }
  }, [planId]);

  useEffect(() => {
    if (!enabled) return;

    function startPolling() {
      // Don't double-start
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchPlan, POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        // Fetch immediately on return, then resume interval
        fetchPlan();
        startPolling();
      } else {
        stopPolling();
      }
    }

    // Start polling if tab is already visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, fetchPlan]);
}
