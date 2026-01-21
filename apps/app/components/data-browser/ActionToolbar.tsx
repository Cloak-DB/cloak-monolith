'use client';

import { Plus, Trash2, AlertTriangle, Check, X, Loader2 } from 'lucide-react';

interface ActionToolbarProps {
  onNewRow: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  hasUnsavedChanges: boolean;
  // Pending changes props
  changeCount: number;
  rowCount: number;
  newRowCount: number;
  isSaving: boolean;
  saveError?: string | null;
  onSave: () => void;
  onDiscard: () => void;
}

export function ActionToolbar({
  onNewRow,
  selectedCount,
  onDeleteSelected,
  hasUnsavedChanges,
  changeCount,
  rowCount,
  newRowCount,
  isSaving,
  saveError,
  onSave,
  onDiscard,
}: ActionToolbarProps) {
  const hasPendingChanges = changeCount > 0 || newRowCount > 0;

  const getPendingMessage = () => {
    const parts: string[] = [];

    if (newRowCount > 0) {
      parts.push(`${newRowCount} new row${newRowCount > 1 ? 's' : ''}`);
    }

    const editedRows = rowCount - newRowCount;
    if (editedRows > 0) {
      parts.push(
        `${changeCount} change${changeCount > 1 ? 's' : ''} in ${editedRows} row${editedRows > 1 ? 's' : ''}`,
      );
    }

    return parts.join(', ');
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30">
      {/* Left side: New Row and Selection */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewRow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded"
        >
          <Plus size={16} />
          New Row
        </button>

        {selectedCount > 0 && (
          <>
            <div className="h-4 w-px bg-gray-300 dark:bg-slate-700 mx-1" />
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onDeleteSelected}
              disabled={hasUnsavedChanges}
              title={
                hasUnsavedChanges
                  ? 'Save or discard changes before deleting'
                  : undefined
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}
      </div>

      {/* Right side: Pending Changes (always present to reserve space) */}
      <div className="flex items-center gap-2 min-h-[32px]">
        {hasPendingChanges ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle
                size={16}
                className="text-yellow-600 dark:text-yellow-500"
              />
              <span className="text-yellow-800 dark:text-yellow-200">
                {getPendingMessage()}
              </span>
              {saveError && (
                <span className="text-red-500 dark:text-red-400 ml-2">
                  Error: {saveError}
                </span>
              )}
            </div>
            <button
              onClick={onDiscard}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 rounded disabled:opacity-50"
            >
              <X size={14} />
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save Changes
                </>
              )}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
