'use client';

import { useState, useCallback } from 'react';
import type { ColumnInfo } from '@/lib/db-types';
import type { ValidationError } from '@/lib/validation';
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import { Skeleton } from '@cloak-db/ui/components/skeleton';
import { EditableCell } from './cells';
import { RowContextMenu } from './RowContextMenu';
import type { SelectionModifiers } from './hooks';
import { useDevOverrides } from '@/lib/dev/use-dev-overrides';
import {
  SKELETON_ROWS,
  CELL_CLASSES,
  ROW_NUMBER_CLASSES,
  getSkeletonWidthPercent,
} from './constants';

interface CellSelectionModifiers {
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

interface DataGridProps {
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  onSort?: (column: string) => void;
  isLoading?: boolean;
  // Editing props
  primaryKeyColumns?: string[];
  editingEnabled?: boolean;
  hasCellChange?: (rowKey: string, column: string) => boolean;
  getCellValue?: (rowKey: string, column: string) => unknown | undefined;
  getCellError?: (
    rowKey: string,
    column: string,
  ) => ValidationError | undefined;
  onCellChange?: (
    rowKey: string,
    primaryKey: Record<string, unknown>,
    column: string,
    originalValue: unknown,
    newValue: unknown,
  ) => void;
  onExpandCell?: (
    rowKey: string,
    row: Record<string, unknown>,
    column: string,
  ) => void;
  // New rows
  newRows?: Array<{ tempId: string; data: Record<string, unknown> }>;
  // Row selection props (for row-level operations like delete)
  selectionEnabled?: boolean;
  isRowSelected?: (rowKey: string) => boolean;
  isAllSelected?: boolean;
  rowSelectedCount?: number;
  onToggleRowSelection?: (
    rowKey: string,
    modifiers?: SelectionModifiers,
  ) => void;
  onToggleSelectAll?: (allKeys: string[]) => void;
  // Cell selection props (for multi-cell editing)
  selectedCells?: Set<string>;
  onCellSelect?: (
    rowKey: string,
    column: string,
    modifiers: CellSelectionModifiers,
    value: unknown,
  ) => void;
  onClearCellSelection?: () => void;
  livePreviewValue?: unknown;
  editingCellKey?: string | null;
  onLiveValueChange?: (value: unknown) => void;
  onEditStart?: (rowKey: string, column: string) => void;
  onEditEnd?: () => void;
  // Context menu actions
  onEditRow?: (rowKey: string, row: Record<string, unknown>) => void;
  onDuplicateRow?: (row: Record<string, unknown>) => void;
  onDeleteRow?: (rowKey: string, row: Record<string, unknown>) => void;
  canDeleteRow?: (rowKey: string) => boolean;
  // Copy feedback callback
  onCopySuccess?: () => void;
  // Cell-specific pending change operations (for context menu)
  onSaveCellChange?: (rowKey: string, column: string) => void;
  onDiscardCellChange?: (rowKey: string, column: string) => void;
  isSaving?: boolean;
}

function formatCellValue(value: unknown, type: string): React.ReactNode {
  if (value === null) {
    return (
      <span className="text-gray-500 dark:text-slate-500 italic">NULL</span>
    );
  }

  if (value === undefined) {
    return <span className="text-gray-500 dark:text-slate-500">-</span>;
  }

  switch (type) {
    case 'boolean':
    case 'bool':
      return value ? (
        <span className="text-green-400">true</span>
      ) : (
        <span className="text-red-400">false</span>
      );

    case 'json':
    case 'jsonb':
      try {
        const str = JSON.stringify(value);
        return (
          <code className="text-xs text-gray-600 dark:text-slate-300 max-w-[200px] truncate block">
            {str}
          </code>
        );
      } catch {
        return String(value);
      }

    case 'timestamp':
    case 'timestamptz':
    case 'date':
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);

    default:
      const str = String(value);
      if (str.length > 100) {
        return (
          <span title={str} className="cursor-help">
            {str.slice(0, 100)}...
          </span>
        );
      }
      return str;
  }
}

function getRowKey(
  row: Record<string, unknown>,
  primaryKeyColumns: string[],
): string {
  if (primaryKeyColumns.length === 0) {
    return JSON.stringify(row);
  }
  const keyParts = primaryKeyColumns.map((col) => `${col}:${String(row[col])}`);
  return keyParts.join('|');
}

function getPrimaryKey(
  row: Record<string, unknown>,
  primaryKeyColumns: string[],
): Record<string, unknown> {
  const pk: Record<string, unknown> = {};
  primaryKeyColumns.forEach((col) => {
    pk[col] = row[col];
  });
  return pk;
}

export function DataGrid({
  columns,
  rows,
  orderBy,
  onSort,
  isLoading,
  primaryKeyColumns = [],
  editingEnabled = false,
  hasCellChange,
  getCellValue,
  getCellError,
  onCellChange,
  onExpandCell,
  newRows = [],
  selectionEnabled = false,
  isRowSelected,
  isAllSelected,
  rowSelectedCount = 0,
  onToggleRowSelection,
  onToggleSelectAll,
  selectedCells,
  onCellSelect,
  onClearCellSelection,
  livePreviewValue,
  editingCellKey,
  onLiveValueChange,
  onEditStart,
  onEditEnd,
  onEditRow,
  onDuplicateRow,
  onDeleteRow,
  canDeleteRow,
  onCopySuccess,
  onSaveCellChange,
  onDiscardCellChange,
  isSaving,
}: DataGridProps) {
  // Dev overrides for testing loading states
  const { isForceLoading } = useDevOverrides();
  const effectiveIsLoading = isLoading || isForceLoading;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    rowKey: string;
    row: Record<string, unknown>;
    position: { x: number; y: number };
    cellColumn: string | null;
    cellValue: unknown;
  } | null>(null);

  // Clipboard state for cell operations
  const [clipboard, setClipboard] = useState<unknown>(undefined);

  // Clear cell selection when clicking on empty areas
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Only clear if clicking directly on the container or table (not on cells)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'DIV' ||
        target.tagName === 'TABLE' ||
        target.tagName === 'TBODY' ||
        target.tagName === 'TR'
      ) {
        // Don't clear if using modifier keys (user might be trying to select)
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
          onClearCellSelection?.();
        }
      }
    },
    [onClearCellSelection],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, rowKey: string, row: Record<string, unknown>) => {
      e.preventDefault();

      // Try to detect which cell was clicked
      let cellColumn: string | null = null;
      let cellValue: unknown = undefined;

      const target = e.target as HTMLElement;
      const cell = target.closest('td');
      if (cell) {
        const cellIndex = cell.cellIndex;
        // Account for selection checkbox column
        const columnIndex = selectionEnabled ? cellIndex - 1 : cellIndex;
        if (columnIndex >= 0 && columnIndex < columns.length) {
          cellColumn = columns[columnIndex].name;
          const pendingValue = getCellValue?.(rowKey, cellColumn);
          cellValue =
            pendingValue !== undefined ? pendingValue : row[cellColumn];
        }
      }

      setContextMenu({
        rowKey,
        row,
        position: { x: e.clientX, y: e.clientY },
        cellColumn,
        cellValue,
      });
    },
    [columns, selectionEnabled, getCellValue],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Cell operation handlers
  const handleCopy = useCallback(() => {
    if (contextMenu?.cellColumn !== null) {
      setClipboard(contextMenu?.cellValue);
      // Also copy to system clipboard as text
      const textValue =
        contextMenu?.cellValue === null
          ? 'NULL'
          : typeof contextMenu?.cellValue === 'object'
            ? JSON.stringify(contextMenu?.cellValue)
            : String(contextMenu?.cellValue ?? '');
      navigator.clipboard
        .writeText(textValue)
        .then(() => {
          onCopySuccess?.();
        })
        .catch(() => {
          // Ignore clipboard errors
        });
    }
  }, [contextMenu, onCopySuccess]);

  const handleCut = useCallback(() => {
    if (contextMenu && contextMenu.cellColumn !== null) {
      // Copy first
      setClipboard(contextMenu.cellValue);
      const textValue =
        contextMenu.cellValue === null
          ? 'NULL'
          : typeof contextMenu.cellValue === 'object'
            ? JSON.stringify(contextMenu.cellValue)
            : String(contextMenu.cellValue ?? '');
      navigator.clipboard
        .writeText(textValue)
        .then(() => {
          onCopySuccess?.();
        })
        .catch(() => {});

      // Then set to null
      const isNewRow = contextMenu.rowKey.startsWith('new:');
      const pk = isNewRow
        ? {}
        : getPrimaryKey(contextMenu.row, primaryKeyColumns);
      onCellChange?.(
        contextMenu.rowKey,
        pk,
        contextMenu.cellColumn,
        contextMenu.row[contextMenu.cellColumn],
        null,
      );
    }
  }, [contextMenu, primaryKeyColumns, onCellChange, onCopySuccess]);

  const handlePaste = useCallback(() => {
    if (
      contextMenu &&
      contextMenu.cellColumn !== null &&
      clipboard !== undefined
    ) {
      const isNewRow = contextMenu.rowKey.startsWith('new:');
      const pk = isNewRow
        ? {}
        : getPrimaryKey(contextMenu.row, primaryKeyColumns);
      onCellChange?.(
        contextMenu.rowKey,
        pk,
        contextMenu.cellColumn,
        contextMenu.row[contextMenu.cellColumn],
        clipboard,
      );
    }
  }, [contextMenu, clipboard, primaryKeyColumns, onCellChange]);

  const handleSetNull = useCallback(() => {
    if (contextMenu && contextMenu.cellColumn !== null) {
      const isNewRow = contextMenu.rowKey.startsWith('new:');
      const pk = isNewRow
        ? {}
        : getPrimaryKey(contextMenu.row, primaryKeyColumns);
      onCellChange?.(
        contextMenu.rowKey,
        pk,
        contextMenu.cellColumn,
        contextMenu.row[contextMenu.cellColumn],
        null,
      );
    }
  }, [contextMenu, primaryKeyColumns, onCellChange]);

  const handleSetEmptyString = useCallback(() => {
    if (contextMenu && contextMenu.cellColumn !== null) {
      const isNewRow = contextMenu.rowKey.startsWith('new:');
      const pk = isNewRow
        ? {}
        : getPrimaryKey(contextMenu.row, primaryKeyColumns);
      onCellChange?.(
        contextMenu.rowKey,
        pk,
        contextMenu.cellColumn,
        contextMenu.row[contextMenu.cellColumn],
        '',
      );
    }
  }, [contextMenu, primaryKeyColumns, onCellChange]);

  const getSortIcon = (columnName: string) => {
    if (orderBy?.column !== columnName) {
      return null;
    }
    return orderBy.direction === 'asc' ? (
      <ChevronUp size={14} className="text-yellow-400" />
    ) : (
      <ChevronDown size={14} className="text-yellow-400" />
    );
  };

  const isColumnEditable = (column: ColumnInfo): boolean => {
    if (!editingEnabled) return false;
    if (primaryKeyColumns.includes(column.name)) return false;
    if (column.default?.includes('nextval')) return false;
    return true;
  };

  const getAllRowKeys = useCallback(() => {
    const keys: string[] = [];
    newRows.forEach(({ tempId }) => keys.push(`new:${tempId}`));
    rows.forEach((row) => keys.push(getRowKey(row, primaryKeyColumns)));
    return keys;
  }, [rows, newRows, primaryKeyColumns]);

  const renderCell = (
    row: Record<string, unknown>,
    column: ColumnInfo,
    rowKey: string,
    isNewRow: boolean,
  ) => {
    const originalValue = row[column.name];
    const pendingValue = getCellValue?.(rowKey, column.name);
    const displayValue =
      pendingValue !== undefined ? pendingValue : originalValue;
    const isModified = hasCellChange?.(rowKey, column.name) ?? false;
    const validationError = getCellError?.(rowKey, column.name);
    const isEditable = isColumnEditable(column);

    // Cell selection state
    const cellKey = `${rowKey}:${column.name}`;
    const isCellSelected = selectedCells?.has(cellKey) ?? false;
    const isBeingEdited = editingCellKey === cellKey;

    // Show preview in selected cells (except the one being edited)
    const showPreview =
      isCellSelected && !isBeingEdited && livePreviewValue !== undefined;
    const previewDisplayValue = showPreview
      ? formatCellValue(livePreviewValue, column.udtName)
      : undefined;

    if (!editingEnabled) {
      return (
        <td
          key={column.name}
          className="px-3 py-2 text-gray-700 dark:text-slate-300 max-w-[300px] truncate"
        >
          {formatCellValue(displayValue, column.udtName)}
        </td>
      );
    }

    return (
      <td key={column.name} className="p-0 h-10">
        <EditableCell
          column={column}
          value={displayValue}
          displayValue={formatCellValue(displayValue, column.udtName)}
          isModified={isModified}
          isEditable={isEditable}
          validationError={validationError}
          isSelected={isCellSelected}
          previewValue={showPreview ? livePreviewValue : undefined}
          previewDisplayValue={previewDisplayValue}
          onCellSelect={(modifiers) =>
            onCellSelect?.(rowKey, column.name, modifiers, displayValue)
          }
          onValueChange={(newValue) => {
            if (onCellChange) {
              const pk = isNewRow ? {} : getPrimaryKey(row, primaryKeyColumns);
              onCellChange(rowKey, pk, column.name, originalValue, newValue);
            }
          }}
          onLiveValueChange={onLiveValueChange}
          onExpand={() => onExpandCell?.(rowKey, row, column.name)}
          onEditStart={() => onEditStart?.(rowKey, column.name)}
          onEditEnd={onEditEnd}
        />
      </td>
    );
  };

  const renderRowNumber = (rowKey: string, rowNumber: number | 'new') => {
    if (!selectionEnabled) return null;

    const isSelected = isRowSelected?.(rowKey) ?? false;

    return (
      <td
        className={`w-12 px-3 py-2 text-center cursor-pointer select-none transition-colors ${
          isSelected
            ? 'bg-yellow-500 text-black font-medium'
            : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleRowSelection?.(rowKey, {
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
          });
        }}
      >
        <span className="text-xs font-mono">
          {rowNumber === 'new' ? '•' : rowNumber}
        </span>
      </td>
    );
  };

  const renderRowNumberHeader = () => {
    if (!selectionEnabled) return null;

    const hasSelection = (rowSelectedCount ?? 0) > 0;

    return (
      <th
        className={`w-12 px-3 py-2 text-center cursor-pointer select-none transition-colors ${
          hasSelection
            ? 'bg-yellow-500 text-black'
            : 'text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`}
        onClick={() => onToggleSelectAll?.(getAllRowKeys())}
        title={hasSelection ? 'Clear selection' : 'Select all'}
      >
        <span className="text-xs font-semibold">#</span>
      </th>
    );
  };

  return (
    <div
      className="overflow-auto flex-1 relative"
      onClick={handleContainerClick}
    >
      {effectiveIsLoading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-10">
          <table className="w-full text-sm">
            {/* Skeleton header - matches actual header structure */}
            <thead className="sticky top-0 bg-gray-100 dark:bg-slate-800">
              <tr className="border-b border-gray-200 dark:border-slate-700">
                {selectionEnabled && (
                  <th
                    className={`${ROW_NUMBER_CLASSES.width} ${ROW_NUMBER_CLASSES.paddingX} ${ROW_NUMBER_CLASSES.paddingY}`}
                  >
                    <Skeleton className="h-4 w-6 mx-auto" />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className={`text-left ${CELL_CLASSES.paddingX} ${CELL_CLASSES.paddingY}`}
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Skeleton rows - matches actual row structure */}
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-200 dark:border-slate-800"
                >
                  {selectionEnabled && (
                    <td
                      className={`${ROW_NUMBER_CLASSES.width} ${ROW_NUMBER_CLASSES.paddingX} ${ROW_NUMBER_CLASSES.paddingY} text-center`}
                    >
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => {
                    // Width based on column type for realistic skeleton
                    const widthPercent = getSkeletonWidthPercent(
                      col.type,
                      col.maxLength,
                      rowIndex,
                    );
                    return (
                      <td
                        key={col.name}
                        className={`${CELL_CLASSES.paddingX} ${CELL_CLASSES.paddingY} ${CELL_CLASSES.height}`}
                        style={{ maxWidth: 300 }}
                      >
                        <Skeleton
                          className="h-4"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <table className="w-full text-sm select-none">
        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-slate-800">
          <tr className="border-b border-gray-200 dark:border-slate-700">
            {renderRowNumberHeader()}
            {columns.map((column) => (
              <th
                key={column.name}
                className={`text-left px-3 py-2 text-gray-600 dark:text-slate-400 font-medium whitespace-nowrap ${
                  onSort
                    ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 select-none'
                    : ''
                }`}
                onClick={() => onSort?.(column.name)}
              >
                <div className="flex items-center gap-1">
                  <span>{column.name}</span>
                  {getSortIcon(column.name)}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500 font-normal">
                  {column.type}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* New rows at the top */}
          {newRows.map(({ tempId, data }) => {
            const rowKey = `new:${tempId}`;
            const rowIsSelected = isRowSelected?.(rowKey) ?? false;
            return (
              <tr
                key={rowKey}
                className={`border-b border-gray-200 dark:border-slate-800 bg-green-100 dark:bg-green-900/20 ${
                  rowIsSelected ? 'ring-1 ring-inset ring-yellow-500/50' : ''
                }`}
                onContextMenu={(e) => handleContextMenu(e, rowKey, data)}
              >
                {renderRowNumber(rowKey, 'new')}
                {columns.map((column) =>
                  renderCell(data, column, rowKey, true),
                )}
              </tr>
            );
          })}

          {/* Existing rows */}
          {rows.length === 0 && newRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectionEnabled ? 1 : 0)}
                className="px-3 py-12 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Inbox
                    size={32}
                    className="text-gray-400 dark:text-slate-500"
                  />
                  <p className="text-gray-500 dark:text-slate-400 font-medium">
                    No rows found
                  </p>
                  <p className="text-sm text-gray-400 dark:text-slate-500">
                    This table is empty or no rows match your filters
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowKey = getRowKey(row, primaryKeyColumns);
              const rowIsSelected = isRowSelected?.(rowKey) ?? false;
              const rowNumber = index + 1;

              return (
                <tr
                  key={rowKey}
                  className={`border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 ${
                    rowIsSelected
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 ring-1 ring-inset ring-yellow-500/50'
                      : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, rowKey, row)}
                >
                  {renderRowNumber(rowKey, rowNumber)}
                  {columns.map((column) =>
                    renderCell(row, column, rowKey, false),
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Context Menu */}
      <RowContextMenu
        isOpen={contextMenu !== null}
        position={contextMenu?.position ?? { x: 0, y: 0 }}
        onClose={closeContextMenu}
        onEdit={() => {
          if (contextMenu) {
            onEditRow?.(contextMenu.rowKey, contextMenu.row);
          }
        }}
        onDuplicate={() => {
          if (contextMenu) {
            onDuplicateRow?.(contextMenu.row);
          }
        }}
        onDelete={() => {
          if (contextMenu) {
            onDeleteRow?.(contextMenu.rowKey, contextMenu.row);
          }
        }}
        canDelete={
          contextMenu ? (canDeleteRow?.(contextMenu.rowKey) ?? true) : true
        }
        cellColumn={contextMenu?.cellColumn}
        cellValue={contextMenu?.cellValue}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onSetNull={handleSetNull}
        onSetEmptyString={handleSetEmptyString}
        canPaste={clipboard !== undefined}
        hasCellPendingChange={
          contextMenu?.cellColumn
            ? (hasCellChange?.(contextMenu.rowKey, contextMenu.cellColumn) ??
              false)
            : false
        }
        onSaveCellChange={
          contextMenu?.cellColumn
            ? () =>
                onSaveCellChange?.(contextMenu.rowKey, contextMenu.cellColumn!)
            : undefined
        }
        onDiscardCellChange={
          contextMenu?.cellColumn
            ? () =>
                onDiscardCellChange?.(
                  contextMenu.rowKey,
                  contextMenu.cellColumn!,
                )
            : undefined
        }
        isSaving={isSaving}
      />
    </div>
  );
}
