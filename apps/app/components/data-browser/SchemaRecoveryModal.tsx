'use client';

import { RefreshCw, X, AlertTriangle } from 'lucide-react';

export interface PendingEditSummary {
  /** Total number of pending edits */
  total: number;
  /** Number of edits that can be preserved (column still exists, type compatible) */
  preservable: number;
  /** Number of edits that will be lost (column deleted or type incompatible) */
  lost: number;
  /** Column names that will lose their edits */
  lostColumns: string[];
}

interface SchemaRecoveryModalProps {
  isOpen: boolean;
  /** Description of what triggered the error */
  errorDescription?: string;
  /** Summary of pending edits and what will happen to them */
  pendingEdits?: PendingEditSummary;
  /** Called when user confirms refresh */
  onRefresh: () => void;
  /** Called when user cancels (stays with stale data) */
  onCancel: () => void;
  /** Whether refresh is in progress */
  isRefreshing?: boolean;
}

export function SchemaRecoveryModal({
  isOpen,
  errorDescription,
  pendingEdits,
  onRefresh,
  onCancel,
  isRefreshing,
}: SchemaRecoveryModalProps) {
  if (!isOpen) {
    return null;
  }

  const hasLostEdits = pendingEdits && pendingEdits.lost > 0;
  const hasPendingEdits = pendingEdits && pendingEdits.total > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Database Schema Changed
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isRefreshing}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-6 space-y-4">
          <p className="text-gray-700 dark:text-slate-300">
            The database structure has changed since you opened this table. This
            can happen after running migrations.
          </p>

          {errorDescription && (
            <div className="bg-gray-100 dark:bg-slate-700/50 rounded p-3 text-sm text-gray-600 dark:text-slate-400">
              {errorDescription}
            </div>
          )}

          {hasPendingEdits && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Pending edits: {pendingEdits.total} cell
                {pendingEdits.total > 1 ? 's' : ''}
              </p>

              <ul className="text-sm space-y-1">
                {pendingEdits.preservable > 0 && (
                  <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {pendingEdits.preservable} edit
                    {pendingEdits.preservable > 1 ? 's' : ''} can be preserved
                    (columns still exist)
                  </li>
                )}
                {hasLostEdits && (
                  <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>
                      {pendingEdits.lost} edit{pendingEdits.lost > 1 ? 's' : ''}{' '}
                      will be lost
                      {pendingEdits.lostColumns.length > 0 && (
                        <span className="text-gray-500 dark:text-slate-400">
                          {' '}
                          (column
                          {pendingEdits.lostColumns.length > 1 ? 's' : ''}:{' '}
                          {pendingEdits.lostColumns.join(', ')})
                        </span>
                      )}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onCancel}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh & Retry'}
          </button>
        </div>
      </div>
    </div>
  );
}
