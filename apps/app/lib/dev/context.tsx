'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

interface DevContextValue {
  forceLoading: boolean;
  setForceLoading: (value: boolean) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
}

const DevContext = createContext<DevContextValue | null>(null);

export function useDevContext() {
  return useContext(DevContext);
}

interface DevProviderProps {
  children: ReactNode;
}

export function DevProvider({ children }: DevProviderProps) {
  const [forceLoading, setForceLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Cmd+Shift+D / Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);

  return (
    <DevContext.Provider
      value={{
        forceLoading,
        setForceLoading,
        isDrawerOpen,
        toggleDrawer,
      }}
    >
      {children}
    </DevContext.Provider>
  );
}
