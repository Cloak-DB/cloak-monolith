'use client';

import { useState, useCallback, useMemo } from 'react';

export interface CellChange {
  column: string;
  originalValue: unknown;
  newValue: unknown;
}

export interface RowChanges {
  type: 'create' | 'update';
  tempId?: string; // For new rows before DB assignment
  primaryKey?: Record<string, unknown>; // For updates
  changes: CellChange[];
  data: Record<string, unknown>; // Full row data for creates
}

export interface PendingChangesState {
  changes: Map<string, RowChanges>;
  isDirty: boolean;
  changeCount: number;
  rowCount: number;
  newRowCount: number;
}

export interface UsePendingChangesReturn {
  state: PendingChangesState;
  // Cell operations
  setCellValue: (
    rowKey: string,
    primaryKey: Record<string, unknown>,
    column: string,
    originalValue: unknown,
    newValue: unknown,
  ) => void;
  getCellValue: (rowKey: string, column: string) => unknown | undefined;
  hasCellChange: (rowKey: string, column: string) => boolean;
  discardCellChange: (rowKey: string, column: string) => void;
  // Row operations
  addNewRow: (tempId: string, data: Record<string, unknown>) => void;
  updateNewRow: (tempId: string, column: string, value: unknown) => void;
  removeNewRow: (tempId: string) => void;
  getNewRows: () => Array<{ tempId: string; data: Record<string, unknown> }>;
  // Bulk operations
  discardAll: () => void;
  discardRow: (rowKey: string) => void;
  getChangesForSave: () => {
    creates: Array<{ tempId: string; data: Record<string, unknown> }>;
    updates: Array<{
      primaryKey: Record<string, unknown>;
      data: Record<string, unknown>;
    }>;
  };
  getCellChangeForSave: (
    rowKey: string,
    column: string,
  ) => {
    primaryKey: Record<string, unknown>;
    data: Record<string, unknown>;
  } | null;
  markSaved: () => void;
  markCellSaved: (rowKey: string, column: string) => void;
}

export function usePendingChanges(): UsePendingChangesReturn {
  const [changes, setChanges] = useState<Map<string, RowChanges>>(new Map());

  const state = useMemo<PendingChangesState>(() => {
    let changeCount = 0;
    let newRowCount = 0;

    changes.forEach((rowChanges) => {
      if (rowChanges.type === 'create') {
        newRowCount++;
        changeCount += Object.keys(rowChanges.data).length;
      } else {
        changeCount += rowChanges.changes.length;
      }
    });

    return {
      changes,
      isDirty: changes.size > 0,
      changeCount,
      rowCount: changes.size,
      newRowCount,
    };
  }, [changes]);

  const setCellValue = useCallback(
    (
      rowKey: string,
      primaryKey: Record<string, unknown>,
      column: string,
      originalValue: unknown,
      newValue: unknown,
    ) => {
      setChanges((prev) => {
        const newChanges = new Map(prev);
        const existing = newChanges.get(rowKey);

        // If value is back to original, remove the change
        if (originalValue === newValue) {
          if (existing && existing.type === 'update') {
            const filteredChanges = existing.changes.filter(
              (c) => c.column !== column,
            );
            if (filteredChanges.length === 0) {
              newChanges.delete(rowKey);
            } else {
              newChanges.set(rowKey, { ...existing, changes: filteredChanges });
            }
          }
          return newChanges;
        }

        if (existing && existing.type === 'update') {
          // Update existing change or add new one
          const existingChangeIndex = existing.changes.findIndex(
            (c) => c.column === column,
          );
          const updatedChanges = [...existing.changes];

          if (existingChangeIndex >= 0) {
            updatedChanges[existingChangeIndex] = {
              column,
              originalValue,
              newValue,
            };
          } else {
            updatedChanges.push({ column, originalValue, newValue });
          }

          newChanges.set(rowKey, { ...existing, changes: updatedChanges });
        } else if (!existing) {
          // Create new update entry
          newChanges.set(rowKey, {
            type: 'update',
            primaryKey,
            changes: [{ column, originalValue, newValue }],
            data: {},
          });
        }

        return newChanges;
      });
    },
    [],
  );

  const getCellValue = useCallback(
    (rowKey: string, column: string): unknown | undefined => {
      const rowChanges = changes.get(rowKey);
      if (!rowChanges) return undefined;

      if (rowChanges.type === 'create') {
        return rowChanges.data[column];
      }

      const change = rowChanges.changes.find((c) => c.column === column);
      return change?.newValue;
    },
    [changes],
  );

  const hasCellChange = useCallback(
    (rowKey: string, column: string): boolean => {
      const rowChanges = changes.get(rowKey);
      if (!rowChanges) return false;

      if (rowChanges.type === 'create') {
        return column in rowChanges.data;
      }

      return rowChanges.changes.some((c) => c.column === column);
    },
    [changes],
  );

  const discardCellChange = useCallback((rowKey: string, column: string) => {
    setChanges((prev) => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(rowKey);

      if (!existing) return prev;

      if (existing.type === 'update') {
        const filteredChanges = existing.changes.filter(
          (c) => c.column !== column,
        );
        if (filteredChanges.length === 0) {
          newChanges.delete(rowKey);
        } else {
          newChanges.set(rowKey, { ...existing, changes: filteredChanges });
        }
      }

      return newChanges;
    });
  }, []);

  const addNewRow = useCallback(
    (tempId: string, data: Record<string, unknown>) => {
      setChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(`new:${tempId}`, {
          type: 'create',
          tempId,
          changes: [],
          data,
        });
        return newChanges;
      });
    },
    [],
  );

  const updateNewRow = useCallback(
    (tempId: string, column: string, value: unknown) => {
      setChanges((prev) => {
        const newChanges = new Map(prev);
        const key = `new:${tempId}`;
        const existing = newChanges.get(key);

        if (existing && existing.type === 'create') {
          newChanges.set(key, {
            ...existing,
            data: { ...existing.data, [column]: value },
          });
        }

        return newChanges;
      });
    },
    [],
  );

  const removeNewRow = useCallback((tempId: string) => {
    setChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.delete(`new:${tempId}`);
      return newChanges;
    });
  }, []);

  const getNewRows = useCallback(() => {
    const newRows: Array<{ tempId: string; data: Record<string, unknown> }> =
      [];
    changes.forEach((rowChanges) => {
      if (rowChanges.type === 'create' && rowChanges.tempId) {
        newRows.push({ tempId: rowChanges.tempId, data: rowChanges.data });
      }
    });
    return newRows;
  }, [changes]);

  const discardAll = useCallback(() => {
    setChanges(new Map());
  }, []);

  const discardRow = useCallback((rowKey: string) => {
    setChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.delete(rowKey);
      return newChanges;
    });
  }, []);

  const getChangesForSave = useCallback(() => {
    const creates: Array<{ tempId: string; data: Record<string, unknown> }> =
      [];
    const updates: Array<{
      primaryKey: Record<string, unknown>;
      data: Record<string, unknown>;
    }> = [];

    changes.forEach((rowChanges) => {
      if (rowChanges.type === 'create' && rowChanges.tempId) {
        creates.push({ tempId: rowChanges.tempId, data: rowChanges.data });
      } else if (rowChanges.type === 'update' && rowChanges.primaryKey) {
        const data: Record<string, unknown> = {};
        rowChanges.changes.forEach((c) => {
          data[c.column] = c.newValue;
        });
        updates.push({ primaryKey: rowChanges.primaryKey, data });
      }
    });

    return { creates, updates };
  }, [changes]);

  const markSaved = useCallback(() => {
    setChanges(new Map());
  }, []);

  const getCellChangeForSave = useCallback(
    (rowKey: string, column: string) => {
      const rowChanges = changes.get(rowKey);
      if (
        !rowChanges ||
        rowChanges.type !== 'update' ||
        !rowChanges.primaryKey
      ) {
        return null;
      }

      const change = rowChanges.changes.find((c) => c.column === column);
      if (!change) return null;

      return {
        primaryKey: rowChanges.primaryKey,
        data: { [column]: change.newValue },
      };
    },
    [changes],
  );

  const markCellSaved = useCallback((rowKey: string, column: string) => {
    setChanges((prev) => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(rowKey);

      if (!existing || existing.type !== 'update') return prev;

      const filteredChanges = existing.changes.filter(
        (c) => c.column !== column,
      );
      if (filteredChanges.length === 0) {
        newChanges.delete(rowKey);
      } else {
        newChanges.set(rowKey, { ...existing, changes: filteredChanges });
      }

      return newChanges;
    });
  }, []);

  return {
    state,
    setCellValue,
    getCellValue,
    hasCellChange,
    discardCellChange,
    addNewRow,
    updateNewRow,
    removeNewRow,
    getNewRows,
    discardAll,
    discardRow,
    getChangesForSave,
    getCellChangeForSave,
    markSaved,
    markCellSaved,
  };
}
