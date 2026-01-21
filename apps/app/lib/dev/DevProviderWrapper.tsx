'use client';

import type { ReactNode } from 'react';
import { DevProvider } from './context';

interface DevProviderWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper that provides DevContext.
 * The context is always available, but UI components (DevTools, DevDrawer)
 * handle their own production gating via process.env.NODE_ENV checks.
 */
export function DevProviderWrapper({ children }: DevProviderWrapperProps) {
  return <DevProvider>{children}</DevProvider>;
}
