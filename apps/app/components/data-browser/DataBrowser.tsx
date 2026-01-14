'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import type { ColumnInfo, Filter } from '@/lib/db-types';
import { DataGrid } from './DataGrid';
import { Pagination } from './Pagination';
import { FilterBar } from './FilterBar';
import { ActionToolbar } from './ActionToolbar';
import { PendingChangesBar } from './PendingChangesBar';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { RowDetailModal } from './RowDetailModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import {
  usePendingChanges,
  useNavigationGuard,
  useRowSelection,
  useCellSelection,
} from './hooks';
import { Database } from 'lucide-react';
import { fuzzySearchRows } from '@/lib/fuzzy-search';

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

  // Fuzzy search (client-side filtering on current page)
  const [fuzzyQuery, setFuzzyQuery] = useState('');

  // Navigation guard
  const navigationGuard = useNavigationGuard({
    isDirty: pendingChanges.state.isDirty,
  });

  // Notify parent of unsaved changes
  useEffect(() => {
    onHasChanges?.(pendingChanges.state.isDirty);
  }, [pendingChanges.state.isDirty, onHasChanges]);

  // Get primary key columns
  const primaryKeyColumns = useMemo(
    () => columns.filter((c) => c.isPrimaryKey).map((c) => c.name),
    [columns],
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
    filters: filters.length > 0 ? filters : undefined,
  });

  // Mutations
  const updateRowMutation = trpc.table.updateRow.useMutation();
  const createRowMutation = trpc.table.createRow.useMutation();
  const deleteRowMutation = trpc.table.deleteRow.useMutation();

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
  const copyCellValue = useCallback(async (value: unknown) => {
    const text = value === null ? '' : String(value);
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [cellSelection, getRowDataFromKey, pendingChanges]);

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

  // Handle cell change - apply to all selected cells
  const handleCellChange = useCallback(
    (
      rowKey: string,
      primaryKey: Record<string, unknown>,
      column: string,
      originalValue: unknown,
      newValue: unknown,
    ) => {
      // Get all rows to update from cell selection
      const selectedRowKeys = cellSelection.getSelectedRowKeys();

      // If editing cell is in selection and there are other selected cells, apply to all
      const cellKey = `${rowKey}:${column}`;
      const rowsToUpdate =
        cellSelection.selectedCells.has(cellKey) && selectedRowKeys.length > 1
          ? selectedRowKeys
          : [rowKey];

      // Apply change to all rows
      rowsToUpdate.forEach((key) => {
        if (key.startsWith('new:')) {
          const tempId = key.replace('new:', '');
          pendingChanges.updateNewRow(tempId, column, newValue);
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
          }
        }
      });

      // Clear cell selection after edit
      cellSelection.clearSelection();
      setLivePreviewValue(undefined);
      setSaveError(null);
    },
    [pendingChanges, cellSelection, getRowDataFromKey],
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

  // Save all pending changes
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const { creates, updates } = pendingChanges.getChangesForSave();

      // Process creates
      for (const { data: rowData } of creates) {
        await createRowMutation.mutateAsync({
          schema,
          table,
          data: rowData,
        });
      }

      // Process updates
      for (const { primaryKey, data: updateData } of updates) {
        await updateRowMutation.mutateAsync({
          schema,
          table,
          primaryKey,
          data: updateData,
        });
      }

      // Clear pending changes and refresh data
      pendingChanges.markSaved();
      await utils.table.getRows.invalidate({ schema, table });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save changes',
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    pendingChanges,
    createRowMutation,
    updateRowMutation,
    schema,
    table,
    utils.table.getRows,
  ]);

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    pendingChanges.discardAll();
    setSaveError(null);
  }, [pendingChanges]);

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
      {/* Pending Changes Bar */}
      <PendingChangesBar
        changeCount={pendingChanges.state.changeCount}
        rowCount={pendingChanges.state.rowCount}
        newRowCount={pendingChanges.state.newRowCount}
        isSaving={isSaving}
        saveError={saveError}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* Action Toolbar */}
      <ActionToolbar
        onNewRow={handleNewRow}
        selectedCount={rowSelection.selectedCount}
        onDeleteSelected={handleDeleteSelectedRequest}
        hasUnsavedChanges={pendingChanges.state.isDirty}
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
        fuzzyQuery={fuzzyQuery}
        onFuzzyQueryChange={setFuzzyQuery}
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
    </div>
  );
}
