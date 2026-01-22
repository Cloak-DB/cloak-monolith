'use client';

import { useState, useCallback } from 'react';
import {
  isSchemaError,
  getSchemaErrorDescription,
} from '@cloak-db/db-core/errors';
import type { ColumnInfo } from '@/lib/db-types';
import type { PendingEditSummary } from '../SchemaRecoveryModal';
import type { PendingChangesState } from './usePendingChanges';

export interface SchemaRecoveryState {
  /** Whether the recovery modal is open */
  isOpen: boolean;
  /** Description of the error that triggered recovery */
  errorDescription?: string;
  /** The PostgreSQL error code */
  errorCode?: string;
  /** Summary of pending edits and what will happen to them */
  pendingEdits?: PendingEditSummary;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
}

export interface UseSchemaRecoveryOptions {
  /** Current schema name */
  schema: string;
  /** Current table name */
  table: string;
  /** Current columns from the cached schema */
  columns: ColumnInfo[];
  /** Current pending changes state */
  pendingChanges: PendingChangesState;
  /** Callback to invalidate schema cache and refetch */
  onRefreshSchema: () => Promise<void>;
  /** Callback to retry the failed operation */
  onRetry?: () => Promise<void>;
  /** Callback to discard edits for specific columns */
  onDiscardColumns?: (columns: string[]) => void;
}

export interface UseSchemaRecoveryReturn {
  /** Current state of the recovery flow */
  state: SchemaRecoveryState;
  /** Check if an error code indicates a schema mismatch */
  checkError: (errorCode: string | undefined) => boolean;
  /** Trigger the recovery flow for a schema error */
  triggerRecovery: (errorCode: string | undefined) => void;
  /** Handle user confirming refresh */
  handleRefresh: () => Promise<void>;
  /** Handle user canceling (staying with stale data) */
  handleCancel: () => void;
  /** Reset the recovery state */
  reset: () => void;
}

/**
 * Hook to manage schema change detection and recovery flow
 *
 * When a schema-related PostgreSQL error is detected (42703, 42P01, etc.),
 * this hook manages the recovery flow:
 * 1. Shows a modal explaining the situation
 * 2. Calculates which pending edits can be preserved
 * 3. Handles refresh and retry
 */
export function useSchemaRecovery({
  columns,
  pendingChanges,
  onRefreshSchema,
  onRetry,
  onDiscardColumns,
}: UseSchemaRecoveryOptions): UseSchemaRecoveryReturn {
  const [state, setState] = useState<SchemaRecoveryState>({
    isOpen: false,
    isRefreshing: false,
  });

  /**
   * Calculate which pending edits can be preserved after schema change
   * This is called with the NEW columns after refresh to compare
   */
  const calculatePendingEditsSummary = useCallback(
    (newColumns: ColumnInfo[]): PendingEditSummary => {
      const newColumnNames = new Set(newColumns.map((c) => c.name));
      const newColumnTypes = new Map(newColumns.map((c) => [c.name, c.type]));

      let preservable = 0;
      let lost = 0;
      const lostColumns: string[] = [];

      // Analyze each pending change
      pendingChanges.changes.forEach((rowChanges) => {
        rowChanges.changes.forEach((cellChange) => {
          const columnName = cellChange.column;
          const oldColumn = columns.find((c) => c.name === columnName);
          const newColumn = newColumns.find((c) => c.name === columnName);

          if (!newColumnNames.has(columnName)) {
            // Column was deleted
            lost++;
            if (!lostColumns.includes(columnName)) {
              lostColumns.push(columnName);
            }
          } else if (
            oldColumn &&
            newColumn &&
            oldColumn.type !== newColumn.type
          ) {
            // Column type changed - for now, mark as lost
            // Future: could try type coercion
            lost++;
            if (!lostColumns.includes(columnName)) {
              lostColumns.push(columnName);
            }
          } else {
            // Column still exists with same type
            preservable++;
          }
        });
      });

      return {
        total: preservable + lost,
        preservable,
        lost,
        lostColumns,
      };
    },
    [columns, pendingChanges],
  );

  /**
   * Check if an error code indicates a schema mismatch
   */
  const checkError = useCallback((errorCode: string | undefined): boolean => {
    return isSchemaError(errorCode);
  }, []);

  /**
   * Trigger the recovery flow for a schema error
   */
  const triggerRecovery = useCallback(
    (errorCode: string | undefined) => {
      if (!isSchemaError(errorCode)) {
        return;
      }

      const errorDescription = getSchemaErrorDescription(errorCode);

      // Calculate pending edits summary based on current columns
      // (We'll recalculate after refresh with new columns)
      const pendingEdits: PendingEditSummary = {
        total: pendingChanges.changeCount,
        preservable: pendingChanges.changeCount, // Assume all preservable until we know new schema
        lost: 0,
        lostColumns: [],
      };

      setState({
        isOpen: true,
        errorDescription,
        errorCode,
        pendingEdits: pendingChanges.changeCount > 0 ? pendingEdits : undefined,
        isRefreshing: false,
      });
    },
    [pendingChanges.changeCount],
  );

  /**
   * Handle user confirming refresh
   */
  const handleRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));

    try {
      // Refresh schema (invalidate cache, refetch)
      await onRefreshSchema();

      // If we have pending edits and a discard callback, handle lost columns
      // Note: The actual comparison with new columns would need to happen
      // after the schema is refetched, which may require coordination with
      // the parent component
      if (state.pendingEdits?.lostColumns.length && onDiscardColumns) {
        onDiscardColumns(state.pendingEdits.lostColumns);
      }

      // Retry the failed operation if provided
      if (onRetry) {
        await onRetry();
      }

      // Close modal on success
      setState({
        isOpen: false,
        isRefreshing: false,
      });
    } catch (error) {
      // If refresh/retry still fails, keep modal open with error
      setState((prev) => ({
        ...prev,
        isRefreshing: false,
        errorDescription:
          error instanceof Error
            ? error.message
            : 'Failed to refresh schema. Please try again.',
      }));
    }
  }, [onRefreshSchema, onRetry, onDiscardColumns, state.pendingEdits]);

  /**
   * Handle user canceling (staying with stale data)
   */
  const handleCancel = useCallback(() => {
    setState({
      isOpen: false,
      isRefreshing: false,
    });
  }, []);

  /**
   * Reset the recovery state
   */
  const reset = useCallback(() => {
    setState({
      isOpen: false,
      isRefreshing: false,
    });
  }, []);

  return {
    state,
    checkError,
    triggerRecovery,
    handleRefresh,
    handleCancel,
    reset,
  };
}
