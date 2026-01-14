'use client';

import { useState, useCallback, useMemo, useRef } from 'react';

export interface SelectionState {
  selectedKeys: Set<string>;
  isAllSelected: boolean;
}

export interface SelectionModifiers {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

export interface UseRowSelectionReturn {
  selectedKeys: Set<string>;
  isAllSelected: boolean;
  selectedCount: number;
  isSelected: (rowKey: string) => boolean;
  handleRowClick: (
    rowKey: string,
    allKeys: string[],
    modifiers: SelectionModifiers,
  ) => void;
  toggleSelection: (
    rowKey: string,
    allKeys?: string[],
    modifiers?: SelectionModifiers,
  ) => void;
  selectAll: (allKeys: string[]) => void;
  clearSelection: () => void;
  toggleSelectAll: (allKeys: string[]) => void;
}

export function useRowSelection(): UseRowSelectionReturn {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [allKeysCount, setAllKeysCount] = useState(0);
  const lastClickedKeyRef = useRef<string | null>(null);

  const isAllSelected = useMemo(
    () => selectedKeys.size > 0 && selectedKeys.size === allKeysCount,
    [selectedKeys.size, allKeysCount],
  );

  const isSelected = useCallback(
    (rowKey: string) => selectedKeys.has(rowKey),
    [selectedKeys],
  );

  const handleRowClick = useCallback(
    (rowKey: string, allKeys: string[], modifiers: SelectionModifiers) => {
      const { shiftKey, metaKey, ctrlKey } = modifiers;
      const isCmdOrCtrl = metaKey || ctrlKey;

      setSelectedKeys((prev) => {
        // Shift+click: select range from last clicked to current
        if (shiftKey && lastClickedKeyRef.current) {
          const lastIndex = allKeys.indexOf(lastClickedKeyRef.current);
          const currentIndex = allKeys.indexOf(rowKey);

          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeKeys = allKeys.slice(start, end + 1);

            // If Cmd is also held, add to existing selection
            if (isCmdOrCtrl) {
              const newSet = new Set(prev);
              rangeKeys.forEach((key) => newSet.add(key));
              return newSet;
            }

            // Otherwise, replace selection with range
            return new Set(rangeKeys);
          }
        }

        // Cmd/Ctrl+click: toggle individual row in selection
        if (isCmdOrCtrl) {
          const newSet = new Set(prev);
          if (newSet.has(rowKey)) {
            newSet.delete(rowKey);
          } else {
            newSet.add(rowKey);
          }
          lastClickedKeyRef.current = rowKey;
          return newSet;
        }

        // Regular click: select only this row
        lastClickedKeyRef.current = rowKey;
        return new Set([rowKey]);
      });

      // Update last clicked for shift-click range
      if (!shiftKey) {
        lastClickedKeyRef.current = rowKey;
      }
    },
    [],
  );

  const toggleSelection = useCallback(
    (rowKey: string, allKeys?: string[], modifiers?: SelectionModifiers) => {
      const shiftKey = modifiers?.shiftKey ?? false;

      setSelectedKeys((prev) => {
        // Shift+click on checkbox: select range
        if (shiftKey && lastClickedKeyRef.current && allKeys) {
          const lastIndex = allKeys.indexOf(lastClickedKeyRef.current);
          const currentIndex = allKeys.indexOf(rowKey);

          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeKeys = allKeys.slice(start, end + 1);

            // Add range to existing selection
            const newSet = new Set(prev);
            rangeKeys.forEach((key) => newSet.add(key));
            return newSet;
          }
        }

        // Regular click: toggle single row
        const newSet = new Set(prev);
        if (newSet.has(rowKey)) {
          newSet.delete(rowKey);
        } else {
          newSet.add(rowKey);
        }
        return newSet;
      });

      // Update last clicked for future shift-click range
      if (!shiftKey) {
        lastClickedKeyRef.current = rowKey;
      }
    },
    [],
  );

  const selectAll = useCallback((allKeys: string[]) => {
    setSelectedKeys(new Set(allKeys));
    setAllKeysCount(allKeys.length);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
    lastClickedKeyRef.current = null;
  }, []);

  const toggleSelectAll = useCallback(
    (allKeys: string[]) => {
      setAllKeysCount(allKeys.length);
      if (isAllSelected) {
        setSelectedKeys(new Set());
      } else {
        setSelectedKeys(new Set(allKeys));
      }
    },
    [isAllSelected],
  );

  return {
    selectedKeys,
    isAllSelected,
    selectedCount: selectedKeys.size,
    isSelected,
    handleRowClick,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
  };
}
