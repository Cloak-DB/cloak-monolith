'use client';

import { DevDrawer } from './DevDrawer';

/**
 * Production gate for DevTools.
 * Returns null in production builds (tree-shaken).
 */
export function DevTools() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DevDrawer />;
}
