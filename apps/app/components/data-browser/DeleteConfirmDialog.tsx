'use client';

import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  rowCount: number;
  tableName: string;
  primaryKeyInfo?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  rowCount,
  tableName,
  primaryKeyInfo,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isBulk = rowCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete {isBulk ? `${rowCount} Rows` : 'Row'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-6">
          <p className="text-gray-600 dark:text-slate-300">
            Are you sure you want to delete{' '}
            {isBulk ? (
              <span className="font-semibold text-red-500 dark:text-red-400">
                {rowCount} rows
              </span>
            ) : (
              'this row'
            )}
            ?
          </p>

          <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <span className="text-gray-500 dark:text-slate-500">Table:</span>{' '}
              <span className="text-gray-700 dark:text-slate-300">
                {tableName}
              </span>
            </p>
            {primaryKeyInfo && !isBulk && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                <span className="text-gray-500 dark:text-slate-500">
                  Primary Key:
                </span>{' '}
                <span className="text-gray-700 dark:text-slate-300 font-mono text-xs">
                  {primaryKeyInfo}
                </span>
              </p>
            )}
          </div>

          <p className="text-sm text-red-500 dark:text-red-400 mt-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-medium rounded disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
