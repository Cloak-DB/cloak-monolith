'use client';

import { AlertTriangle, Check, X, Loader2 } from 'lucide-react';

interface PendingChangesBarProps {
  changeCount: number;
  rowCount: number;
  newRowCount: number;
  isSaving: boolean;
  saveError?: string | null;
  onSave: () => void;
  onDiscard: () => void;
}

export function PendingChangesBar({
  changeCount,
  rowCount,
  newRowCount,
  isSaving,
  saveError,
  onSave,
  onDiscard,
}: PendingChangesBarProps) {
  if (changeCount === 0 && newRowCount === 0) {
    return null;
  }

  const getMessage = () => {
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
    <div className="flex items-center justify-between px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-700/50">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle
          size={16}
          className="text-yellow-600 dark:text-yellow-500"
        />
        <span className="text-yellow-800 dark:text-yellow-200">
          {getMessage()}
        </span>
        {saveError && (
          <span className="text-red-500 dark:text-red-400 ml-2">
            Error: {saveError}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
