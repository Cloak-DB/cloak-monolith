'use client';

import { useState, useCallback, useRef } from 'react';

export interface CellKey {
  rowKey: string;
  column: string;
}

export interface UseCellSelectionReturn {
  selectedCells: Set<string>;
  selectedColumn: string | null;
  lastSelectedCell: CellKey | null;
  selectedCount: number;

  // Actions
  toggleCell: (rowKey: string, column: string) => void;
  selectRange: (rowKey: string, column: string, allRowKeys: string[]) => void;
  clearSelection: () => void;

  // Queries
  isCellSelected: (rowKey: string, column: string) => boolean;
  getSelectedRowKeys: () => string[];
}

function makeCellKey(rowKey: string, column: string): string {
  return `${rowKey}:${column}`;
}

function parseCellKey(cellKey: string): CellKey {
  const lastColonIndex = cellKey.lastIndexOf(':');
  return {
    rowKey: cellKey.substring(0, lastColonIndex),
    column: cellKey.substring(lastColonIndex + 1),
  };
}

export function useCellSelection(): UseCellSelectionReturn {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const lastSelectedCellRef = useRef<CellKey | null>(null);

  const toggleCell = useCallback(
    (rowKey: string, column: string) => {
      const cellKey = makeCellKey(rowKey, column);

      setSelectedCells((prev) => {
        // If selecting a different column, clear selection and start fresh
        if (selectedColumn !== null && selectedColumn !== column) {
          const newSet = new Set<string>([cellKey]);
          setSelectedColumn(column);
          lastSelectedCellRef.current = { rowKey, column };
          return newSet;
        }

        const newSet = new Set(prev);
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey);
          // If no more cells selected, clear column tracking
          if (newSet.size === 0) {
            setSelectedColumn(null);
            lastSelectedCellRef.current = null;
          }
        } else {
          newSet.add(cellKey);
          setSelectedColumn(column);
          lastSelectedCellRef.current = { rowKey, column };
        }
        return newSet;
      });
    },
    [selectedColumn],
  );

  const selectRange = useCallback(
    (rowKey: string, column: string, allRowKeys: string[]) => {
      // If no last selected cell or different column, just select this cell
      if (
        !lastSelectedCellRef.current ||
        lastSelectedCellRef.current.column !== column
      ) {
        const cellKey = makeCellKey(rowKey, column);
        setSelectedCells(new Set([cellKey]));
        setSelectedColumn(column);
        lastSelectedCellRef.current = { rowKey, column };
        return;
      }

      // Find indices for range selection
      const lastRowKey = lastSelectedCellRef.current.rowKey;
      const lastIndex = allRowKeys.indexOf(lastRowKey);
      const currentIndex = allRowKeys.indexOf(rowKey);

      if (lastIndex === -1 || currentIndex === -1) {
        // Fallback to single selection if keys not found
        const cellKey = makeCellKey(rowKey, column);
        setSelectedCells(new Set([cellKey]));
        setSelectedColumn(column);
        lastSelectedCellRef.current = { rowKey, column };
        return;
      }

      // Select range
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const rangeRowKeys = allRowKeys.slice(start, end + 1);

      const newSet = new Set<string>();
      rangeRowKeys.forEach((rk) => {
        newSet.add(makeCellKey(rk, column));
      });

      setSelectedCells(newSet);
      setSelectedColumn(column);
      // Don't update lastSelectedCellRef on shift-click to allow expanding range
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedCells(new Set());
    setSelectedColumn(null);
    lastSelectedCellRef.current = null;
  }, []);

  const isCellSelected = useCallback(
    (rowKey: string, column: string): boolean => {
      return selectedCells.has(makeCellKey(rowKey, column));
    },
    [selectedCells],
  );

  const getSelectedRowKeys = useCallback((): string[] => {
    const rowKeys: string[] = [];
    selectedCells.forEach((cellKey) => {
      const { rowKey } = parseCellKey(cellKey);
      if (!rowKeys.includes(rowKey)) {
        rowKeys.push(rowKey);
      }
    });
    return rowKeys;
  }, [selectedCells]);

  return {
    selectedCells,
    selectedColumn,
    lastSelectedCell: lastSelectedCellRef.current,
    selectedCount: selectedCells.size,

    toggleCell,
    selectRange,
    clearSelection,

    isCellSelected,
    getSelectedRowKeys,
  };
}
