'use client';

import { Plus, Trash2 } from 'lucide-react';

interface ActionToolbarProps {
  onNewRow: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  hasUnsavedChanges: boolean;
}

export function ActionToolbar({
  onNewRow,
  selectedCount,
  onDeleteSelected,
  hasUnsavedChanges,
}: ActionToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/30">
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
  );
}
