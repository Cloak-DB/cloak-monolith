'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@cloak-db/ui/components/toast';
import type { ColumnInfo, Filter } from '@/lib/db-types';
import { validateCellValue, mapPgErrorToValidation } from '@/lib/validation';
import { isSchemaError } from '@cloak-db/db-core/errors';
import { DataGrid } from './DataGrid';
import { Pagination } from './Pagination';
import { FilterBar } from './FilterBar';
import { ActionToolbar } from './ActionToolbar';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { RowDetailModal } from './RowDetailModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import {
  usePendingChanges,
  useNavigationGuard,
  useRowSelection,
  useCellSelection,
  useSchemaRecovery,
} from './hooks';
import { SchemaRecoveryModal } from './SchemaRecoveryModal';
import { Database } from 'lucide-react';
import { fuzzySearchRows } from '@/lib/fuzzy-search';
import { ALL_COLUMNS_KEY } from './filter';

interface DataBrowserProps {
  schema: string;
  table: string;
  columns: ColumnInfo[];
  onHasChanges?: (hasChanges: boolean) => void;
}

// Generate unique temp IDs for new rows
let tempIdCounter = 0;
function generateTempId(): string {
  return `temp_${Date.now()}_${++tempIdCounter}`;
}

export function DataBrowser({
  schema,
  table,
  columns,
  onHasChanges,
}: DataBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const { success: toastSuccess, error: toastError } = useToast();

  // Parse URL params
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 50;
  const sortColumn = searchParams.get('sort') || undefined;
  const sortDir = (searchParams.get('dir') as 'asc' | 'desc') || 'asc';

  // Parse filters from URL
  const filtersParam = searchParams.get('filters');
  const filters: Filter[] = useMemo(() => {
    if (!filtersParam) return [];
    try {
      return filtersParam.split(',').map((f) => {
        const [column, operator, ...valueParts] = f.split(':');
        const value = valueParts.join(':');
        return {
          column,
          operator: operator as Filter['operator'],
          value: value || undefined,
        };
      });
    } catch {
      return [];
    }
  }, [filtersParam]);

  // Pending changes management
  const pendingChanges = usePendingChanges();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Row selection (for row-level operations like delete)
  const rowSelection = useRowSelection();

  // Cell selection (for multi-cell editing)
  const cellSelection = useCellSelection();
  const [livePreviewValue, setLivePreviewValue] = useState<unknown>(undefined);
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null);

  // Row detail modal state
  const [detailModalRow, setDetailModalRow] = useState<{
    rowKey: string;
    data: Record<string, unknown>;
    highlightField?: string;
  } | null>(null);

  // Delete confirmation state
  const [deleteState, setDeleteState] = useState<{
    rowKeys: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keyboard shortcuts modal
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Ref to expose filter state actions for keyboard shortcuts
  const filterStateRef = useRef<{
    openPopover: () => void;
    focusChip: (index: number) => void;
    toggleHelp: () => void;
  } | null>(null);

  // Extract "All columns" (fuzzy search) filter value from filters
  const allColumnsFilter = useMemo(
    () => filters.find((f) => f.column === ALL_COLUMNS_KEY),
    [filters],
  );
  const fuzzyQuery = allColumnsFilter?.value
    ? String(allColumnsFilter.value)
    : '';

  // Filters to send to the server (exclude client-side only filters)
  const serverFilters = useMemo(
    () => filters.filter((f) => f.column !== ALL_COLUMNS_KEY),
    [filters],
  );

  // Navigation guard
  const navigationGuard = useNavigationGuard({
    isDirty: pendingChanges.state.isDirty,
  });

  // Schema recovery - detect and recover from schema changes (e.g., after migrations)
  const handleRefreshSchema = useCallback(async () => {
    // Invalidate both schema and data caches to get fresh data
    await Promise.all([
      utils.schema.getColumns.invalidate({ schema, table }),
      utils.table.getRows.invalidate({ schema, table }),
    ]);
  }, [utils.schema.getColumns, utils.table.getRows, schema, table]);

  const schemaRecovery = useSchemaRecovery({
    schema,
    table,
    columns,
    pendingChanges: pendingChanges.state,
    onRefreshSchema: handleRefreshSchema,
    // onRetry is not provided - user will retry manually after refresh
  });

  // Proactive schema drift detection - detect when columns change while there are pending edits
  const prevColumnsRef = useRef<ColumnInfo[]>(columns);
  useEffect(() => {
    const prevColumns = prevColumnsRef.current;
    prevColumnsRef.current = columns;

    // Skip if no pending changes or if this is the initial render
    if (!pendingChanges.state.isDirty || prevColumns === columns) {
      return;
    }

    // Check if any edited columns were removed or changed type
    const prevColumnMap = new Map(prevColumns.map((c) => [c.name, c]));
    const newColumnMap = new Map(columns.map((c) => [c.name, c]));

    // Get all columns that have pending edits
    const editedColumns = new Set<string>();
    pendingChanges.state.changes.forEach((rowChanges) => {
      rowChanges.changes.forEach((cellChange) => {
        editedColumns.add(cellChange.column);
      });
    });

    // Check if any edited column was removed or changed type
    let hasDrift = false;
    for (const colName of editedColumns) {
      const prevCol = prevColumnMap.get(colName);
      const newCol = newColumnMap.get(colName);

      if (prevCol && !newCol) {
        // Column was removed
        hasDrift = true;
        break;
      }
      if (prevCol && newCol && prevCol.type !== newCol.type) {
        // Column type changed
        hasDrift = true;
        break;
      }
    }

    if (hasDrift) {
      // Trigger recovery modal with a synthetic "schema changed" message
      schemaRecovery.triggerRecovery('SCHEMA_DRIFT');
    }
  }, [
    columns,
    pendingChanges.state.isDirty,
    pendingChanges.state.changes,
    schemaRecovery,
  ]);

  // Notify parent of unsaved changes
  useEffect(() => {
    onHasChanges?.(pendingChanges.state.isDirty);
  }, [pendingChanges.state.isDirty, onHasChanges]);

  // Get primary key columns
  const primaryKeyColumns = useMemo(
    () => columns.filter((c) => c.isPrimaryKey).map((c) => c.name),
    [columns],
  );

  // Check if a column is editable (not a primary key or auto-increment)
  const isColumnEditable = useCallback(
    (columnName: string): boolean => {
      if (primaryKeyColumns.includes(columnName)) return false;
      const column = columns.find((c) => c.name === columnName);
      if (column?.default?.includes('nextval')) return false;
      return true;
    },
    [columns, primaryKeyColumns],
  );

  // Fetch data
  const { data, isLoading, error } = trpc.table.getRows.useQuery({
    schema,
    table,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    orderBy: sortColumn
      ? { column: sortColumn, direction: sortDir }
      : undefined,
    filters: serverFilters.length > 0 ? serverFilters : undefined,
  });

  // Mutations
  const updateRowMutation = trpc.table.updateRow.useMutation();
  const createRowMutation = trpc.table.createRow.useMutation();
  const deleteRowMutation = trpc.table.deleteRow.useMutation();
  const saveBatchMutation = trpc.table.saveBatch.useMutation();

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize);

  // Apply fuzzy search filter (client-side, current page only)
  const filteredRows = useMemo(() => {
    const rows = data?.rows ?? [];
    if (!fuzzyQuery.trim()) {
      return rows;
    }
    return fuzzySearchRows(rows, fuzzyQuery);
  }, [data?.rows, fuzzyQuery]);

  // Get all row keys (for range selection)
  const getAllRowKeys = useCallback(() => {
    const keys: string[] = [];
    pendingChanges
      .getNewRows()
      .forEach(({ tempId }) => keys.push(`new:${tempId}`));
    data?.rows.forEach((row) => {
      const keyParts = primaryKeyColumns.map(
        (col) => `${col}:${String(row[col])}`,
      );
      keys.push(keyParts.join('|'));
    });
    return keys;
  }, [data?.rows, primaryKeyColumns, pendingChanges]);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const handlePageSizeChange = (size: number) => {
    updateParams({ pageSize: String(size), page: '1' });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDir === 'asc') {
        updateParams({ dir: 'desc' });
      } else {
        updateParams({ sort: null, dir: null });
      }
    } else {
      updateParams({ sort: column, dir: 'asc', page: '1' });
    }
  };

  const handleFiltersChange = (newFilters: Filter[]) => {
    if (newFilters.length === 0) {
      updateParams({ filters: null, page: '1' });
    } else {
      const filtersStr = newFilters
        .map((f) => `${f.column}:${f.operator}:${f.value ?? ''}`)
        .join(',');
      updateParams({ filters: filtersStr, page: '1' });
    }
  };

  // Helper to get row data and primary key from rowKey
  const getRowDataFromKey = useCallback(
    (
      rowKey: string,
    ): { row: Record<string, unknown>; pk: Record<string, unknown> } | null => {
      if (rowKey.startsWith('new:')) {
        const tempId = rowKey.replace('new:', '');
        const newRow = pendingChanges
          .getNewRows()
          .find((r) => r.tempId === tempId);
        if (newRow) {
          return { row: newRow.data, pk: {} };
        }
        return null;
      }

      // Find in existing rows
      const row = data?.rows.find((r) => {
        const key = primaryKeyColumns
          .map((col) => `${col}:${String(r[col])}`)
          .join('|');
        return key === rowKey;
      });

      if (row) {
        const pk: Record<string, unknown> = {};
        primaryKeyColumns.forEach((col) => {
          pk[col] = row[col];
        });
        return { row, pk };
      }

      return null;
    },
    [data?.rows, primaryKeyColumns, pendingChanges],
  );

  // Copy cell value to clipboard
  const copyCellValue = useCallback(
    async (value: unknown) => {
      const text = value === null ? '' : String(value);
      try {
        await navigator.clipboard.writeText(text);
        toastSuccess('Copied to clipboard', 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
    [toastSuccess],
  );

  // Copy selected cells to clipboard
  const copySelectedCells = useCallback(async () => {
    if (cellSelection.selectedCount === 0) return;

    const values: string[] = [];
    const column = cellSelection.selectedColumn;

    if (!column) return;

    // Get values from all selected cells
    cellSelection.selectedCells.forEach((cellKey) => {
      const lastColonIndex = cellKey.lastIndexOf(':');
      const rowKey = cellKey.substring(0, lastColonIndex);

      const rowData = getRowDataFromKey(rowKey);
      if (rowData) {
        // Check for pending value first
        const pendingValue = pendingChanges.getCellValue(rowKey, column);
        const value =
          pendingValue !== undefined ? pendingValue : rowData.row[column];
        values.push(value === null ? '' : String(value));
      }
    });

    const text = values.join(', ');
    try {
      await navigator.clipboard.writeText(text);
      const count = values.length;
      toastSuccess(
        count === 1
          ? 'Copied to clipboard'
          : `Copied ${count} values to clipboard`,
        2000,
      );
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [cellSelection, getRowDataFromKey, pendingChanges, toastSuccess]);

  // Paste from clipboard to selected cells
  const pasteToSelectedCells = useCallback(async () => {
    if (cellSelection.selectedCount === 0) {
      toastError('Select a cell first to paste', 2000);
      return;
    }

    const column = cellSelection.selectedColumn;
    if (!column) return;

    // Check if column is editable (not a primary key or auto-increment)
    if (!isColumnEditable(column)) {
      toastError('Cannot paste to read-only column', 2000);
      return;
    }

    try {
      // Read from system clipboard
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        toastError('Clipboard is empty', 2000);
        return;
      }

      // Try to parse the value appropriately
      let pastedValue: unknown = clipboardText;

      // Handle special string values
      if (clipboardText === 'NULL' || clipboardText === 'null') {
        pastedValue = null;
      } else if (clipboardText === 'true') {
        pastedValue = true;
      } else if (clipboardText === 'false') {
        pastedValue = false;
      } else {
        // Try to parse as JSON for objects/arrays
        try {
          const parsed = JSON.parse(clipboardText);
          if (typeof parsed === 'object') {
            pastedValue = parsed;
          }
        } catch {
          // Not JSON, use as string
        }
      }

      // Find the column info for validation
      const columnInfo = columns.find((c) => c.name === column);

      // Apply to all selected cells
      let pasteCount = 0;
      cellSelection.selectedCells.forEach((cellKey) => {
        const lastColonIndex = cellKey.lastIndexOf(':');
        const rowKey = cellKey.substring(0, lastColonIndex);

        const rowData = getRowDataFromKey(rowKey);
        if (rowData) {
          // Validate the new value
          let validationError = undefined;
          if (columnInfo) {
            const validationResult = validateCellValue(columnInfo, pastedValue);
            if (!validationResult.valid && validationResult.error) {
              validationError = validationResult.error;
            }
          }

          if (rowKey.startsWith('new:')) {
            const tempId = rowKey.replace('new:', '');
            pendingChanges.updateNewRow(
              tempId,
              column,
              pastedValue,
              validationError,
            );
          } else {
            const currentValue = rowData.row[column];
            pendingChanges.setCellValue(
              rowKey,
              rowData.pk,
              column,
              currentValue,
              pastedValue,
            );
            if (validationError) {
              pendingChanges.setCellError(rowKey, column, validationError);
            } else {
              pendingChanges.clearCellError(rowKey, column);
            }
          }
          pasteCount++;
        }
      });

      if (pasteCount > 0) {
        toastSuccess(
          pasteCount === 1 ? 'Pasted' : `Pasted to ${pasteCount} cells`,
          2000,
        );
      }

      // Clear cell selection after paste
      cellSelection.clearSelection();
    } catch (err) {
      // Clipboard access denied or failed
      console.error('Failed to read clipboard:', err);
      toastError('Failed to access clipboard', 2000);
    }
  }, [
    cellSelection,
    columns,
    getRowDataFromKey,
    pendingChanges,
    toastSuccess,
    toastError,
    isColumnEditable,
  ]);

  // Cut selected cells (copy to clipboard, then set to null)
  const cutSelectedCells = useCallback(async () => {
    if (cellSelection.selectedCount === 0) return;

    const column = cellSelection.selectedColumn;
    if (!column) return;

    // Check if column is editable (not a primary key or auto-increment)
    if (!isColumnEditable(column)) {
      toastError('Cannot cut from read-only column', 2000);
      return;
    }

    // First, copy values to clipboard
    const values: string[] = [];
    const cellsToUpdate: Array<{
      rowKey: string;
      rowData: { row: Record<string, unknown>; pk: Record<string, unknown> };
    }> = [];

    cellSelection.selectedCells.forEach((cellKey) => {
      const lastColonIndex = cellKey.lastIndexOf(':');
      const rowKey = cellKey.substring(0, lastColonIndex);

      const rowData = getRowDataFromKey(rowKey);
      if (rowData) {
        const pendingValue = pendingChanges.getCellValue(rowKey, column);
        const value =
          pendingValue !== undefined ? pendingValue : rowData.row[column];
        values.push(value === null ? '' : String(value));
        cellsToUpdate.push({ rowKey, rowData });
      }
    });

    const text = values.join(', ');
    try {
      await navigator.clipboard.writeText(text);

      // Then set all cells to null
      cellsToUpdate.forEach(({ rowKey, rowData }) => {
        if (rowKey.startsWith('new:')) {
          const tempId = rowKey.replace('new:', '');
          pendingChanges.updateNewRow(tempId, column, null);
        } else {
          const currentValue = rowData.row[column];
          pendingChanges.setCellValue(
            rowKey,
            rowData.pk,
            column,
            currentValue,
            null,
          );
        }
      });

      const count = cellsToUpdate.length;
      toastSuccess(
        count === 1 ? 'Cut to clipboard' : `Cut ${count} cells to clipboard`,
        2000,
      );
      cellSelection.clearSelection();
    } catch (err) {
      console.error('Failed to cut:', err);
      toastError('Failed to access clipboard', 2000);
    }
  }, [
    cellSelection,
    getRowDataFromKey,
    pendingChanges,
    toastSuccess,
    toastError,
    isColumnEditable,
  ]);

  // Handle cell selection
  const handleCellSelect = useCallback(
    (
      rowKey: string,
      column: string,
      modifiers: { metaKey: boolean; shiftKey: boolean; altKey: boolean },
      value: unknown,
    ) => {
      // Alt+click: copy cell value to clipboard
      if (modifiers.altKey) {
        copyCellValue(value);
        return;
      }

      if (modifiers.shiftKey) {
        cellSelection.selectRange(rowKey, column, getAllRowKeys());
      } else if (modifiers.metaKey) {
        cellSelection.toggleCell(rowKey, column);
      }
    },
    [cellSelection, getAllRowKeys, copyCellValue],
  );

  // Handle edit start
  const handleEditStart = useCallback((rowKey: string, column: string) => {
    setEditingCellKey(`${rowKey}:${column}`);
  }, []);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    setEditingCellKey(null);
    setLivePreviewValue(undefined);
  }, []);

  // Handle live value change (for preview)
  const handleLiveValueChange = useCallback((value: unknown) => {
    setLivePreviewValue(value);
  }, []);

  // Handle cell change - apply to all selected cells with validation
  const handleCellChange = useCallback(
    (
      rowKey: string,
      primaryKey: Record<string, unknown>,
      column: string,
      originalValue: unknown,
      newValue: unknown,
    ) => {
      // Find the column info for validation
      const columnInfo = columns.find((c) => c.name === column);

      // Validate the new value
      let validationError = undefined;
      if (columnInfo) {
        const validationResult = validateCellValue(columnInfo, newValue);
        if (!validationResult.valid && validationResult.error) {
          validationError = validationResult.error;
          // Show toast for validation error
          toastError(validationResult.error.message, 3000);
        }
      }

      // Get all rows to update from cell selection
      const selectedRowKeys = cellSelection.getSelectedRowKeys();

      // If editing cell is in selection and there are other selected cells, apply to all
      const cellKey = `${rowKey}:${column}`;
      const rowsToUpdate =
        cellSelection.selectedCells.has(cellKey) && selectedRowKeys.length > 1
          ? selectedRowKeys
          : [rowKey];

      // Apply change to all rows (with validation error if any)
      rowsToUpdate.forEach((key) => {
        if (key.startsWith('new:')) {
          const tempId = key.replace('new:', '');
          pendingChanges.updateNewRow(
            tempId,
            column,
            newValue,
            validationError,
          );
        } else {
          const rowData = getRowDataFromKey(key);
          if (rowData) {
            const currentValue = rowData.row[column];
            pendingChanges.setCellValue(
              key,
              rowData.pk,
              column,
              currentValue,
              newValue,
            );
            // Set or clear error for this cell
            if (validationError) {
              pendingChanges.setCellError(key, column, validationError);
            } else {
              pendingChanges.clearCellError(key, column);
            }
          }
        }
      });

      // Clear cell selection after edit
      cellSelection.clearSelection();
      setLivePreviewValue(undefined);
      setSaveError(null);
    },
    [pendingChanges, cellSelection, getRowDataFromKey, columns, toastError],
  );

  // Handle expand cell (open row detail modal)
  const handleExpandCell = useCallback(
    (rowKey: string, row: Record<string, unknown>, column?: string) => {
      setDetailModalRow({ rowKey, data: row, highlightField: column });
    },
    [],
  );

  // Handle row detail modal apply
  const handleRowDetailApply = useCallback(
    (changes: Record<string, unknown>) => {
      if (!detailModalRow) return;

      const { rowKey, data: rowData } = detailModalRow;

      if (rowKey.startsWith('new:')) {
        const tempId = rowKey.replace('new:', '');
        Object.entries(changes).forEach(([col, value]) => {
          pendingChanges.updateNewRow(tempId, col, value);
        });
      } else {
        const pk: Record<string, unknown> = {};
        primaryKeyColumns.forEach((col) => {
          pk[col] = rowData[col];
        });

        Object.entries(changes).forEach(([col, value]) => {
          pendingChanges.setCellValue(rowKey, pk, col, rowData[col], value);
        });
      }

      setDetailModalRow(null);
    },
    [detailModalRow, primaryKeyColumns, pendingChanges],
  );

  // Handle new row
  const handleNewRow = useCallback(() => {
    const tempId = generateTempId();
    const newRowData: Record<string, unknown> = {};

    // Initialize with null values or defaults
    columns.forEach((col) => {
      if (col.default?.includes('nextval')) {
        // Auto-increment - will be generated by DB
        newRowData[col.name] = null;
      } else if (!col.nullable && col.default) {
        // Has default value - let DB handle it
        newRowData[col.name] = null;
      } else {
        newRowData[col.name] = null;
      }
    });

    pendingChanges.addNewRow(tempId, newRowData);
  }, [columns, pendingChanges]);

  // Handle duplicate row
  const handleDuplicateRow = useCallback(
    (row: Record<string, unknown>) => {
      const tempId = generateTempId();
      const newRowData: Record<string, unknown> = {};

      // Copy all values except primary keys and auto-generated fields
      columns.forEach((col) => {
        if (primaryKeyColumns.includes(col.name)) {
          // Skip primary key - let DB generate
          newRowData[col.name] = null;
        } else if (col.default?.includes('nextval')) {
          // Skip auto-increment
          newRowData[col.name] = null;
        } else {
          // Copy the value
          newRowData[col.name] = row[col.name];
        }
      });

      pendingChanges.addNewRow(tempId, newRowData);
    },
    [columns, primaryKeyColumns, pendingChanges],
  );

  // Handle edit row (open modal from context menu - no highlight)
  const handleEditRow = useCallback(
    (rowKey: string, row: Record<string, unknown>) => {
      setDetailModalRow({ rowKey, data: row, highlightField: undefined });
    },
    [],
  );

  // Handle delete row request
  const handleDeleteRowRequest = useCallback(
    (rowKey: string, row: Record<string, unknown>) => {
      // If it's a new row, just remove it from pending
      if (rowKey.startsWith('new:')) {
        const tempId = rowKey.replace('new:', '');
        pendingChanges.removeNewRow(tempId);
        return;
      }

      setDeleteState({ rowKeys: [rowKey], rows: [row] });
    },
    [pendingChanges],
  );

  // Handle delete selected rows
  const handleDeleteSelectedRequest = useCallback(() => {
    const rowsToDelete: { rowKey: string; row: Record<string, unknown> }[] = [];
    const newRowsToRemove: string[] = [];

    rowSelection.selectedKeys.forEach((rowKey) => {
      if (rowKey.startsWith('new:')) {
        newRowsToRemove.push(rowKey.replace('new:', ''));
      } else {
        // Find the row data
        const row = data?.rows.find((r) => {
          const key = primaryKeyColumns
            .map((col) => `${col}:${String(r[col])}`)
            .join('|');
          return key === rowKey;
        });
        if (row) {
          rowsToDelete.push({ rowKey, row });
        }
      }
    });

    // Remove new rows immediately
    newRowsToRemove.forEach((tempId) => pendingChanges.removeNewRow(tempId));

    // Show confirmation for existing rows
    if (rowsToDelete.length > 0) {
      setDeleteState({
        rowKeys: rowsToDelete.map((r) => r.rowKey),
        rows: rowsToDelete.map((r) => r.row),
      });
    }

    rowSelection.clearSelection();
  }, [rowSelection, data?.rows, primaryKeyColumns, pendingChanges]);

  // Handle row checkbox toggle (with shift support)
  const handleToggleRowSelection = useCallback(
    (
      rowKey: string,
      modifiers?: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean },
    ) => {
      rowSelection.toggleSelection(rowKey, getAllRowKeys(), modifiers);
    },
    [rowSelection, getAllRowKeys],
  );

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteState) return;

    setIsDeleting(true);

    try {
      for (const row of deleteState.rows) {
        const pk: Record<string, unknown> = {};
        primaryKeyColumns.forEach((col) => {
          pk[col] = row[col];
        });

        await deleteRowMutation.mutateAsync({
          schema,
          table,
          primaryKey: pk,
        });
      }

      // Refresh data
      await utils.table.getRows.invalidate({ schema, table });
      setDeleteState(null);
    } catch (err) {
      // Error will be shown by the mutation
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteState,
    primaryKeyColumns,
    deleteRowMutation,
    schema,
    table,
    utils.table.getRows,
  ]);

  // Check if row can be deleted
  const canDeleteRow = useCallback(
    (rowKey: string): boolean => {
      // Can't delete rows with pending changes
      if (pendingChanges.state.changes.has(rowKey)) {
        return false;
      }
      return true;
    },
    [pendingChanges.state.changes],
  );

  // Save all pending changes atomically
  const handleSave = useCallback(async () => {
    // Check for validation errors first
    if (pendingChanges.hasValidationErrors()) {
      const errorCount = pendingChanges.state.errorCount;
      toastError(
        `Cannot save: ${errorCount} cell${errorCount > 1 ? 's have' : ' has'} validation errors`,
        4000,
      );
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const { creates, updates } = pendingChanges.getChangesForSave();

      // Use atomic batch save
      const result = await saveBatchMutation.mutateAsync({
        schema,
        table,
        creates: creates.map((c) => c.data),
        updates,
      });

      if (!result.success) {
        // Check if this is a schema mismatch error (e.g., column deleted after migration)
        if (isSchemaError(result.errorCode)) {
          schemaRecovery.triggerRecovery(result.errorCode);
          setIsSaving(false);
          return;
        }

        // Map the PostgreSQL error to a validation error
        const validationError = mapPgErrorToValidation(
          result.errorCode ?? '',
          result.error ?? 'Database error',
          result.errorDetail,
        );

        // Try to identify which row/cell failed
        if (result.failedType && result.failedIndex !== undefined) {
          const failedIndex = result.failedIndex;

          if (result.failedType === 'create' && failedIndex < creates.length) {
            // Error in a new row
            const failedCreate = creates[failedIndex];
            const rowKey = `new:${failedCreate.tempId}`;
            const failedColumn = result.failedColumn;

            if (failedColumn) {
              pendingChanges.setCellError(
                rowKey,
                failedColumn,
                validationError,
              );
            }
          } else if (
            result.failedType === 'update' &&
            failedIndex < updates.length
          ) {
            // Error in an existing row update - find the row key
            const failedUpdate = updates[failedIndex];
            const failedColumn = result.failedColumn;

            // Find the row key from the primary key
            const rowKey = primaryKeyColumns
              .map((col) => `${col}:${String(failedUpdate.primaryKey[col])}`)
              .join('|');

            if (failedColumn) {
              pendingChanges.setCellError(
                rowKey,
                failedColumn,
                validationError,
              );
            }
          }
        }

        toastError(`Save failed: ${validationError.message}`, 4000);
        setSaveError(validationError.message);
        return;
      }

      // Clear pending changes and refresh data
      pendingChanges.markSaved();
      await utils.table.getRows.invalidate({ schema, table });
      toastSuccess('Changes saved successfully', 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(errorMessage);
      toastError(errorMessage, 4000);
    } finally {
      setIsSaving(false);
    }
  }, [
    pendingChanges,
    saveBatchMutation,
    schema,
    table,
    utils.table.getRows,
    primaryKeyColumns,
    toastError,
    toastSuccess,
    schemaRecovery,
  ]);

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    pendingChanges.discardAll();
    setSaveError(null);
  }, [pendingChanges]);

  // Save a single cell change
  const handleSaveCellChange = useCallback(
    async (rowKey: string, column: string) => {
      const cellChange = pendingChanges.getCellChangeForSave(rowKey, column);
      if (!cellChange) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        await updateRowMutation.mutateAsync({
          schema,
          table,
          primaryKey: cellChange.primaryKey,
          data: cellChange.data,
        });

        // Mark this cell as saved
        pendingChanges.markCellSaved(rowKey, column);
        await utils.table.getRows.invalidate({ schema, table });
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : 'Failed to save change',
        );
      } finally {
        setIsSaving(false);
      }
    },
    [pendingChanges, updateRowMutation, schema, table, utils.table.getRows],
  );

  // Discard a single cell change
  const handleDiscardCellChange = useCallback(
    (rowKey: string, column: string) => {
      pendingChanges.discardCellChange(rowKey, column);
    },
    [pendingChanges],
  );

  // Get count of selected cells that have pending changes
  const getSelectedCellsWithChangesCount = useCallback(() => {
    if (cellSelection.selectedCount === 0) return 0;

    const column = cellSelection.selectedColumn;
    if (!column) return 0;

    let count = 0;
    cellSelection.selectedCells.forEach((cellKey) => {
      const lastColonIndex = cellKey.lastIndexOf(':');
      const rowKey = cellKey.substring(0, lastColonIndex);
      if (pendingChanges.hasCellChange(rowKey, column)) {
        count++;
      }
    });
    return count;
  }, [cellSelection, pendingChanges]);

  // Save all selected cells with pending changes
  const handleSaveSelectedCells = useCallback(async () => {
    const column = cellSelection.selectedColumn;
    if (!column) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Collect all cell changes for selected cells
      const cellsToSave: Array<{
        rowKey: string;
        column: string;
      }> = [];

      cellSelection.selectedCells.forEach((cellKey) => {
        const lastColonIndex = cellKey.lastIndexOf(':');
        const rowKey = cellKey.substring(0, lastColonIndex);
        if (pendingChanges.hasCellChange(rowKey, column)) {
          cellsToSave.push({ rowKey, column });
        }
      });

      // Save each cell
      for (const { rowKey, column: col } of cellsToSave) {
        const cellChange = pendingChanges.getCellChangeForSave(rowKey, col);
        if (cellChange) {
          await updateRowMutation.mutateAsync({
            schema,
            table,
            primaryKey: cellChange.primaryKey,
            data: cellChange.data,
          });
          pendingChanges.markCellSaved(rowKey, col);
        }
      }

      await utils.table.getRows.invalidate({ schema, table });
      toastSuccess(
        cellsToSave.length === 1
          ? 'Cell saved'
          : `${cellsToSave.length} cells saved`,
        2000,
      );
      cellSelection.clearSelection();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
      toastError('Failed to save changes', 3000);
    } finally {
      setIsSaving(false);
    }
  }, [
    cellSelection,
    pendingChanges,
    updateRowMutation,
    schema,
    table,
    utils.table.getRows,
    toastSuccess,
    toastError,
  ]);

  // Discard all selected cells with pending changes
  const handleDiscardSelectedCells = useCallback(() => {
    const column = cellSelection.selectedColumn;
    if (!column) return;

    let discardCount = 0;
    cellSelection.selectedCells.forEach((cellKey) => {
      const lastColonIndex = cellKey.lastIndexOf(':');
      const rowKey = cellKey.substring(0, lastColonIndex);
      if (pendingChanges.hasCellChange(rowKey, column)) {
        pendingChanges.discardCellChange(rowKey, column);
        discardCount++;
      }
    });

    if (discardCount > 0) {
      toastSuccess(
        discardCount === 1
          ? 'Change discarded'
          : `${discardCount} changes discarded`,
        2000,
      );
    }
    cellSelection.clearSelection();
  }, [cellSelection, pendingChanges, toastSuccess]);

  // Refs for keyboard handler to avoid re-attaching listeners
  const keyboardStateRef = useRef({
    isDirty: pendingChanges.state.isDirty,
    isSaving,
    rowSelectionCount: rowSelection.selectedCount,
    cellSelectionCount: cellSelection.selectedCount,
  });

  const keyboardActionsRef = useRef({
    handleSave,
    handleNewRow,
    handleDeleteSelectedRequest,
    copySelectedCells,
    pasteToSelectedCells,
    clearRowSelection: rowSelection.clearSelection,
    clearCellSelection: cellSelection.clearSelection,
  });

  // Keep refs in sync with latest values
  useEffect(() => {
    keyboardStateRef.current = {
      isDirty: pendingChanges.state.isDirty,
      isSaving,
      rowSelectionCount: rowSelection.selectedCount,
      cellSelectionCount: cellSelection.selectedCount,
    };
  });

  useEffect(() => {
    keyboardActionsRef.current = {
      handleSave,
      handleNewRow,
      handleDeleteSelectedRequest,
      copySelectedCells,
      pasteToSelectedCells,
      clearRowSelection: rowSelection.clearSelection,
      clearCellSelection: cellSelection.clearSelection,
    };
  });

  // Handle keyboard shortcuts - stable effect, no dependencies
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = keyboardStateRef.current;
      const actions = keyboardActionsRef.current;

      // Don't trigger shortcuts if user is typing in an input
      const isTyping =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      // ? to show keyboard shortcuts (works even when typing)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      // Skip other shortcuts if typing
      if (isTyping) return;

      // Cmd+F to open filter popover
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        filterStateRef.current?.openPopover();
        return;
      }

      // Cmd+1-9 to focus filter chips
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
        const chipIndex = parseInt(e.key, 10) - 1;
        e.preventDefault();
        filterStateRef.current?.focusChip(chipIndex);
        return;
      }

      // Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (state.isDirty && !state.isSaving) {
          actions.handleSave();
        }
      }

      // Ctrl+N for new row
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        actions.handleNewRow();
      }

      // Delete/Backspace for selected rows
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        state.rowSelectionCount > 0
      ) {
        e.preventDefault();
        actions.handleDeleteSelectedRequest();
      }

      // Cmd+C to copy selected cells
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'c' &&
        state.cellSelectionCount > 0
      ) {
        e.preventDefault();
        actions.copySelectedCells();
      }

      // Cmd+V to paste to selected cells
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'v' &&
        state.cellSelectionCount > 0
      ) {
        e.preventDefault();
        actions.pasteToSelectedCells();
      }

      // Escape to clear selections
      if (e.key === 'Escape') {
        actions.clearRowSelection();
        actions.clearCellSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <Database size={48} className="mx-auto text-red-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Error Loading Data
          </h2>
          <p className="text-gray-500 dark:text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Get primary key info for delete dialog
  const getDeletePrimaryKeyInfo = (): string | undefined => {
    if (!deleteState || deleteState.rows.length !== 1) return undefined;
    const row = deleteState.rows[0];
    return primaryKeyColumns
      .map((col) => `${col} = ${String(row[col])}`)
      .join(', ');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      {/* Action Toolbar (includes pending changes indicator) */}
      <ActionToolbar
        onNewRow={handleNewRow}
        selectedCount={rowSelection.selectedCount}
        onDeleteSelected={handleDeleteSelectedRequest}
        hasUnsavedChanges={pendingChanges.state.isDirty}
        changeCount={pendingChanges.state.changeCount}
        rowCount={pendingChanges.state.rowCount}
        newRowCount={pendingChanges.state.newRowCount}
        errorCount={pendingChanges.state.errorCount}
        isSaving={isSaving}
        saveError={saveError}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* Filter Bar */}
      <FilterBar
        columns={columns}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        schema={schema}
        table={table}
        orderBy={
          sortColumn ? { column: sortColumn, direction: sortDir } : undefined
        }
        visibleRowCount={filteredRows.length}
        totalRowCount={data?.rows?.length ?? 0}
        filterStateRef={filterStateRef}
      />

      {/* Data Grid */}
      <DataGrid
        columns={columns}
        rows={filteredRows}
        orderBy={
          sortColumn ? { column: sortColumn, direction: sortDir } : undefined
        }
        onSort={handleSort}
        isLoading={isLoading}
        primaryKeyColumns={primaryKeyColumns}
        editingEnabled={true}
        hasCellChange={pendingChanges.hasCellChange}
        getCellValue={pendingChanges.getCellValue}
        getCellError={pendingChanges.getCellError}
        onCellChange={handleCellChange}
        onExpandCell={handleExpandCell}
        newRows={pendingChanges.getNewRows()}
        // Row selection (for delete, duplicate)
        selectionEnabled={true}
        isRowSelected={rowSelection.isSelected}
        isAllSelected={rowSelection.isAllSelected}
        rowSelectedCount={rowSelection.selectedCount}
        onToggleRowSelection={handleToggleRowSelection}
        onToggleSelectAll={rowSelection.toggleSelectAll}
        // Cell selection (for multi-cell editing)
        selectedCells={cellSelection.selectedCells}
        onCellSelect={handleCellSelect}
        onClearCellSelection={cellSelection.clearSelection}
        livePreviewValue={livePreviewValue}
        editingCellKey={editingCellKey}
        onLiveValueChange={handleLiveValueChange}
        onEditStart={handleEditStart}
        onEditEnd={handleEditEnd}
        // Context menu
        onEditRow={handleEditRow}
        onDuplicateRow={handleDuplicateRow}
        onDeleteRow={handleDeleteRowRequest}
        canDeleteRow={canDeleteRow}
        // Copy feedback
        onCopySuccess={() => toastSuccess('Copied to clipboard', 2000)}
        // Cell-specific pending change operations (for context menu)
        onSaveCellChange={handleSaveCellChange}
        onDiscardCellChange={handleDiscardCellChange}
        isSaving={isSaving}
        // Multi-cell selection operations (for context menu)
        selectedCellCount={cellSelection.selectedCount}
        onCopySelectedCells={copySelectedCells}
        onCutSelectedCells={cutSelectedCells}
        onPasteToSelectedCells={pasteToSelectedCells}
        onSaveSelectedCells={handleSaveSelectedCells}
        onDiscardSelectedCells={handleDiscardSelectedCells}
        getSelectedCellsWithChangesCount={getSelectedCellsWithChangesCount}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={navigationGuard.showWarning}
        changeCount={pendingChanges.state.changeCount}
        rowCount={pendingChanges.state.rowCount}
        onDiscard={() => {
          pendingChanges.discardAll();
          navigationGuard.confirmNavigation();
        }}
        onStay={navigationGuard.cancelNavigation}
        onSave={async () => {
          await handleSave();
          navigationGuard.confirmNavigation();
        }}
        isSaving={isSaving}
      />

      {/* Row Detail Modal */}
      {detailModalRow && (
        <RowDetailModal
          isOpen={true}
          schema={schema}
          table={table}
          columns={columns}
          rowData={detailModalRow.data}
          primaryKeyColumns={primaryKeyColumns}
          highlightField={detailModalRow.highlightField}
          onClose={() => setDetailModalRow(null)}
          onApply={handleRowDetailApply}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteState !== null}
        rowCount={deleteState?.rows.length ?? 0}
        tableName={`${schema}.${table}`}
        primaryKeyInfo={getDeletePrimaryKeyInfo()}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteState(null)}
        isDeleting={isDeleting}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Schema Recovery Modal */}
      <SchemaRecoveryModal
        isOpen={schemaRecovery.state.isOpen}
        errorDescription={schemaRecovery.state.errorDescription}
        pendingEdits={schemaRecovery.state.pendingEdits}
        onRefresh={schemaRecovery.handleRefresh}
        onCancel={schemaRecovery.handleCancel}
        isRefreshing={schemaRecovery.state.isRefreshing}
      />
    </div>
  );
}
