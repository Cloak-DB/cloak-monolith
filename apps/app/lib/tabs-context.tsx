'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

interface ConnectionTabsData {
  tabs: Tab[];
  activeTabId: string | null;
}

interface StorageData {
  connections: Record<string, ConnectionTabsData>;
}

interface TabsContextValue {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'id'>) => string; // returns tab id
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setTabHasChanges: (id: string, hasChanges: boolean) => void;
  getTabById: (id: string) => Tab | undefined;
  // Tab navigation
  navigateToNextTab: () => void;
  navigateToPrevTab: () => void;
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

function loadAllConnectionsFromStorage(): StorageData {
  if (typeof window === 'undefined') {
    return { connections: {} };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Support new format with connections key
      if (parsed.connections) {
        return parsed as StorageData;
      }
    }
  } catch (e) {
    console.error('Failed to load tabs from storage:', e);
  }

  return { connections: {} };
}

function loadTabsForConnection(
  connectionKey: string | null,
): ConnectionTabsData {
  if (!connectionKey) {
    return { tabs: [], activeTabId: null };
  }

  const storageData = loadAllConnectionsFromStorage();
  const connectionData = storageData.connections[connectionKey];

  if (connectionData) {
    // Clear hasUnsavedChanges on load since we can't restore unsaved data
    const tabs = (connectionData.tabs || []).map((t: Tab) => ({
      ...t,
      hasUnsavedChanges: false,
    }));
    return {
      tabs,
      activeTabId:
        connectionData.activeTabId || (tabs.length > 0 ? tabs[0].id : null),
    };
  }

  return { tabs: [], activeTabId: null };
}

function saveTabsForConnection(
  connectionKey: string | null,
  tabs: Tab[],
  activeTabId: string | null,
): void {
  if (typeof window === 'undefined' || !connectionKey) return;

  try {
    const storageData = loadAllConnectionsFromStorage();

    // Don't persist hasUnsavedChanges
    const tabsToSave = tabs.map(({ hasUnsavedChanges, ...rest }) => rest);

    storageData.connections[connectionKey] = {
      tabs: tabsToSave,
      activeTabId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (e) {
    console.error('Failed to save tabs to storage:', e);
  }
}

// ============================================================================
// Provider
// ============================================================================

interface TabsProviderProps {
  children: ReactNode;
  connectionKey: string | null;
}

export function TabsProvider({ children, connectionKey }: TabsProviderProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const previousConnectionKeyRef = useRef<string | null>(null);

  // Load tabs when connection changes
  useEffect(() => {
    // Save current tabs to previous connection before switching
    if (
      isInitialized &&
      previousConnectionKeyRef.current !== null &&
      previousConnectionKeyRef.current !== connectionKey
    ) {
      saveTabsForConnection(
        previousConnectionKeyRef.current,
        tabs,
        activeTabId,
      );
    }

    // Load tabs for new connection
    const { tabs: storedTabs, activeTabId: storedActiveId } =
      loadTabsForConnection(connectionKey);
    setTabs(storedTabs);
    setActiveTabId(storedActiveId);
    setIsInitialized(true);
    previousConnectionKeyRef.current = connectionKey;
  }, [connectionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage on tab changes (not on connection change)
  useEffect(() => {
    if (isInitialized && connectionKey) {
      saveTabsForConnection(connectionKey, tabs, activeTabId);
    }
  }, [tabs, activeTabId, isInitialized, connectionKey]);

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

  const navigateToNextTab = useCallback(() => {
    if (tabs.length === 0) return;
    if (!activeTabId) {
      setActiveTabId(tabs[0].id);
      return;
    }
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTabId(tabs[nextIndex].id);
  }, [tabs, activeTabId]);

  const navigateToPrevTab = useCallback(() => {
    if (tabs.length === 0) return;
    if (!activeTabId) {
      setActiveTabId(tabs[tabs.length - 1].id);
      return;
    }
    const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTabId(tabs[prevIndex].id);
  }, [tabs, activeTabId]);

  const value: TabsContextValue = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab: setTabActiveById,
    setTabHasChanges,
    getTabById,
    navigateToNextTab,
    navigateToPrevTab,
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
