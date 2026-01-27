'use client';

import { useDevContext } from '@/lib/dev/context';

/**
 * Small dev trigger button for the header.
 * Returns null in production builds (tree-shaken).
 */
export function DevTrigger() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const context = useDevContext();
  const toggleDrawer = context?.toggleDrawer;
  const forceLoading = context?.forceLoading ?? false;

  return (
    <button
      onClick={() => toggleDrawer?.()}
      className={`
        h-6 px-2 text-xs font-bold rounded
        border border-purple-500
        transition-colors
        ${
          forceLoading
            ? 'bg-purple-500 text-white'
            : 'bg-transparent text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950'
        }
      `}
      title="Open Dev Tools"
    >
      DEV
    </button>
  );
}
