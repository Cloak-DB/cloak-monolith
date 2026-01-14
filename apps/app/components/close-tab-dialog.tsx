'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTabs } from '@/lib/tabs-context';

interface CloseTabDialogProps {
  onSaveAndClose?: () => void;
}

export function CloseTabDialog({ onSaveAndClose }: CloseTabDialogProps) {
  const { pendingCloseTabId, getTabById, confirmCloseTab, cancelCloseTab } =
    useTabs();
  const dialogRef = useRef<HTMLDivElement>(null);

  const tab = pendingCloseTabId ? getTabById(pendingCloseTabId) : null;

  useEffect(() => {
    if (!pendingCloseTabId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelCloseTab();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingCloseTabId, cancelCloseTab]);

  if (!pendingCloseTabId || !tab) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      cancelCloseTab();
    }
  };

  const handleSaveAndClose = () => {
    if (onSaveAndClose) {
      onSaveAndClose();
    }
    confirmCloseTab();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unsaved Changes
            </h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm mb-4">
              You have unsaved changes in{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {tab.schema}.{tab.table}
              </span>
              . What would you like to do?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={cancelCloseTab}
                className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseTab}
                className="px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                Discard
              </button>
              {onSaveAndClose && (
                <button
                  onClick={handleSaveAndClose}
                  className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded"
                >
                  Save & Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
