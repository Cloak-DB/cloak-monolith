'use client';

import { useEffect, useCallback, useState } from 'react';

interface UseNavigationGuardOptions {
  isDirty: boolean;
  onNavigationAttempt?: () => void;
}

interface UseNavigationGuardReturn {
  showWarning: boolean;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}

export function useNavigationGuard({
  isDirty,
  onNavigationAttempt,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  // Handle browser navigation (refresh, close tab, back button)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but we need to set returnValue
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        setShowWarning(true);
        onNavigationAttempt?.();
      }
    };

    // Push initial state to handle back button
    if (isDirty) {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty, onNavigationAttempt]);

  const confirmNavigation = useCallback(() => {
    setShowWarning(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setShowWarning(false);
    setPendingNavigation(null);
  }, []);

  return {
    showWarning,
    confirmNavigation,
    cancelNavigation,
  };
}
