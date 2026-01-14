'use client';

import { AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  changeCount: number;
  rowCount: number;
  onDiscard: () => void;
  onStay: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function UnsavedChangesModal({
  isOpen,
  changeCount,
  rowCount,
  onDiscard,
  onStay,
  onSave,
  isSaving,
}: UnsavedChangesModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onStay} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unsaved Changes
            </h2>
          </div>
          <button
            onClick={onStay}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-6">
          <p className="text-gray-700 dark:text-slate-300">
            You have{' '}
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              {changeCount} unsaved change{changeCount > 1 ? 's' : ''}
            </span>{' '}
            in{' '}
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              {rowCount} row{rowCount > 1 ? 's' : ''}
            </span>
            .
          </p>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            If you leave now, your changes will be lost.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-50"
          >
            Discard & Leave
          </button>
          <button
            onClick={onStay}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded disabled:opacity-50"
          >
            Stay & Review
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save & Leave'}
          </button>
        </div>
      </div>
    </div>
  );
}
