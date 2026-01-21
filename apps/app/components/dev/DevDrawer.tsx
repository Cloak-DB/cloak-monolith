'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useDevContext } from '@/lib/dev/context';
import { DevToggle } from './DevToggle';

export function DevDrawer() {
  const context = useDevContext();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && context?.isDrawerOpen) {
        context.toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context]);

  if (!context) return null;

  const { forceLoading, setForceLoading, isDrawerOpen, toggleDrawer } = context;

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[280px] z-50
          bg-white dark:bg-gray-900
          border-l-2 border-black dark:border-gray-700
          shadow-[-4px_0px_0px_0px_rgba(0,0,0,1)]
          transform transition-transform duration-200 ease-out
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black dark:border-gray-700 bg-purple-500">
          <h2 className="font-bold text-white">Dev Tools</h2>
          <button
            onClick={toggleDrawer}
            className="p-1 rounded hover:bg-purple-600 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Loading States Section */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Loading States
            </h3>
            <div className="space-y-3">
              <DevToggle
                label="Force Loading"
                description="Show loading skeletons everywhere"
                checked={forceLoading}
                onChange={setForceLoading}
              />
            </div>
          </section>
        </div>

        {/* Footer with keyboard hint */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              ⌘
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              ⇧
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              D
            </kbd>
            {' to toggle'}
          </p>
        </div>
      </div>
    </>
  );
}
