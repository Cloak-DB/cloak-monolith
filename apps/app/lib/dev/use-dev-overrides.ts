'use client';

import { useDevContext } from './context';

/**
 * Safe consumer hook for dev overrides.
 * Returns safe defaults when context is absent (production).
 */
export function useDevOverrides() {
  const context = useDevContext();
  return {
    isForceLoading: context?.forceLoading ?? false,
  };
}
