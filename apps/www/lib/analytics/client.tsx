'use client';

import { useEffect, useRef, useCallback } from 'react';

function getDistinctId(): string {
  if (typeof window === 'undefined') return 'unknown';

  let id = localStorage.getItem('ph_distinct_id');
  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('ph_distinct_id', id);
  }
  return id;
}

async function sendEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  try {
    const response = await fetch('/api/telemetry/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distinctId, event, properties }),
      keepalive: true,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      console.error(
        '[Analytics] Event tracking failed:',
        response.status,
        errorData
      );
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

async function sendPageView(
  distinctId: string,
  path: string,
  referrer?: string
) {
  try {
    const response = await fetch('/api/telemetry/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distinctId, path, referrer }),
      keepalive: true,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      console.error(
        '[Analytics] Pageview tracking failed:',
        response.status,
        errorData
      );
    }
  } catch (error) {
    console.error('[Analytics] Failed to track pageview:', error);
  }
}

export function useAnalytics() {
  const distinctIdRef = useRef<string | null>(null);

  useEffect(() => {
    distinctIdRef.current = getDistinctId();
  }, []);

  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      const distinctId = distinctIdRef.current || getDistinctId();
      sendEvent(distinctId, event, properties);
    },
    []
  );

  const trackPageView = useCallback((path?: string) => {
    const distinctId = distinctIdRef.current || getDistinctId();
    const currentPath = path || window.location.pathname;
    const referrer = document.referrer;
    sendPageView(distinctId, currentPath, referrer);
  }, []);

  return { track, trackPageView };
}
