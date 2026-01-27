'use client';

import { useEffect, useRef, useMemo } from 'react';
import { X, Filter, Command } from 'lucide-react';

interface FilterHelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

function getShortcuts(isMac: boolean): Shortcut[] {
  const mod = isMac ? 'Cmd' : 'Ctrl';

  return [
    { keys: [mod, 'F'], description: 'Open filter popover' },
    { keys: [mod, '1-9'], description: 'Focus filter chip by number' },
    { keys: ['m'], description: 'Edit focused filter' },
    { keys: ['Backspace'], description: 'Delete focused filter' },
    { keys: ['Esc'], description: 'Unfocus filter / Close popover' },
    { keys: ['↑', '↓'], description: 'Navigate column suggestions' },
    { keys: ['Enter'], description: 'Select column / Apply filter' },
  ];
}

function KeyBadge({ keyName, isMac }: { keyName: string; isMac: boolean }) {
  const isModifier = keyName === 'Cmd' || keyName === 'Ctrl';

  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-xs font-medium text-gray-700 dark:text-slate-300 gap-0.5">
      {isModifier && isMac && <Command size={12} />}
      {(!isModifier || !isMac) && <span>{keyName}</span>}
    </kbd>
  );
}

export function FilterHelpOverlay({ isOpen, onClose }: FilterHelpOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }, []);

  const shortcuts = useMemo(() => getShortcuts(isMac), [isMac]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        ref={overlayRef}
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Filter Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm text-gray-600 dark:text-slate-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex} className="flex items-center gap-0.5">
                    {keyIndex > 0 && (
                      <span className="text-gray-400 dark:text-slate-500 text-xs mx-0.5">
                        +
                      </span>
                    )}
                    <KeyBadge keyName={key} isMac={isMac} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <p className="text-xs text-gray-500 dark:text-slate-500 text-center">
            Press <KeyBadge keyName="?" isMac={isMac} /> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
