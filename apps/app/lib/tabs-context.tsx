'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Tab {
  id: string;
  type: 'data' | 'structure' | 'query';
  schema?: string;
  table?: string;
  title?: string; // For query tabs
  hasUnsavedChanges?: boolean;
}

interface TabsContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'id'>) => string; // returns tab id
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setTabHasChanges: (id: string, hasChanges: boolean) => void;
  getTabById: (id: string) => Tab | undefined;
  // For close confirmation dialog
  pendingCloseTabId: string | null;
  setPendingCloseTabId: (id: string | null) => void;
  confirmCloseTab: () => void;
  cancelCloseTab: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'cloak-db-tabs';

// ============================================================================
// Context
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

// ============================================================================
// Helpers
// ============================================================================

function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function findExistingTab(
  tabs: Tab[],
  schema: string | undefined,
  table: string | undefined,
  type: Tab['type'],
): Tab | undefined {
  // Query tabs are always unique - never reuse
  if (type === 'query') return undefined;

  return tabs.find(
    (t) => t.schema === schema && t.table === table && t.type === type,
  );
}

function loadTabsFromStorage(): { tabs: Tab[]; activeTabId: string | null } {
  if (typeof window === 'undefined') {
    return { tabs: [], activeTabId: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clear hasUnsavedChanges on load since we can't restore unsaved data
      const tabs = (parsed.tabs || []).map((t: Tab) => ({
        ...t,
        hasUnsavedChanges: false,
      }));
      return {
        tabs,
        activeTabId:
          parsed.activeTabId || (tabs.length > 0 ? tabs[0].id : null),
      };
    }
  } catch (e) {
    console.error('Failed to load tabs from storage:', e);
  }

  return { tabs: [], activeTabId: null };
}

function saveTabsToStorage(tabs: Tab[], activeTabId: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    // Don't persist hasUnsavedChanges
    const tabsToSave = tabs.map(({ hasUnsavedChanges, ...rest }) => rest);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tabs: tabsToSave, activeTabId }),
    );
  } catch (e) {
    console.error('Failed to save tabs to storage:', e);
  }
}

// ============================================================================
// Provider
// ============================================================================

interface TabsProviderProps {
  children: ReactNode;
}

export function TabsProvider({ children }: TabsProviderProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const { tabs: storedTabs, activeTabId: storedActiveId } =
      loadTabsFromStorage();
    setTabs(storedTabs);
    setActiveTabId(storedActiveId);
    setIsInitialized(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isInitialized) {
      saveTabsToStorage(tabs, activeTabId);
    }
  }, [tabs, activeTabId, isInitialized]);

  const openTab = useCallback(
    (tabData: Omit<Tab, 'id'>): string => {
      // Check if tab already exists
      const existing = findExistingTab(
        tabs,
        tabData.schema,
        tabData.table,
        tabData.type,
      );
      if (existing) {
        setActiveTabId(existing.id);
        return existing.id;
      }

      // Create new tab
      const newTab: Tab = {
        ...tabData,
        id: generateTabId(),
        hasUnsavedChanges: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
      return newTab.id;
    },
    [tabs],
  );

  const closeTab = useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;

      // If tab has unsaved changes, show confirmation dialog
      if (tab.hasUnsavedChanges) {
        setPendingCloseTabId(id);
        return;
      }

      // Close the tab
      setTabs((prev) => prev.filter((t) => t.id !== id));

      // If closing active tab, switch to another
      if (activeTabId === id) {
        const tabIndex = tabs.findIndex((t) => t.id === id);
        const nextTab = tabs[tabIndex + 1] || tabs[tabIndex - 1];
        setActiveTabId(nextTab?.id || null);
      }
    },
    [tabs, activeTabId],
  );

  const confirmCloseTab = useCallback(() => {
    if (!pendingCloseTabId) return;

    const tabIndex = tabs.findIndex((t) => t.id === pendingCloseTabId);
    setTabs((prev) => prev.filter((t) => t.id !== pendingCloseTabId));

    // If closing active tab, switch to another
    if (activeTabId === pendingCloseTabId) {
      const nextTab = tabs[tabIndex + 1] || tabs[tabIndex - 1];
      setActiveTabId(nextTab?.id || null);
    }

    setPendingCloseTabId(null);
  }, [pendingCloseTabId, tabs, activeTabId]);

  const cancelCloseTab = useCallback(() => {
    setPendingCloseTabId(null);
  }, []);

  const setTabActiveById = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const setTabHasChanges = useCallback((id: string, hasChanges: boolean) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, hasUnsavedChanges: hasChanges } : t,
      ),
    );
  }, []);

  const getTabById = useCallback(
    (id: string) => tabs.find((t) => t.id === id),
    [tabs],
  );

  const value: TabsContextValue = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab: setTabActiveById,
    setTabHasChanges,
    getTabById,
    pendingCloseTabId,
    setPendingCloseTabId,
    confirmCloseTab,
    cancelCloseTab,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useTabs(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}
