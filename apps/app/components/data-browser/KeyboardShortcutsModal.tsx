'use client';

import { useEffect, useRef, useMemo } from 'react';
import { X, Keyboard, Command, Option, ArrowBigUp, Delete } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

// Key mappings for different platforms
const keyMappings = {
  mac: {
    mod: { label: 'Cmd', icon: Command },
    alt: { label: 'Opt', icon: Option },
    shift: { label: 'Shift', icon: ArrowBigUp },
    delete: { label: 'Delete', icon: Delete },
  },
  other: {
    mod: { label: 'Ctrl', icon: null },
    alt: { label: 'Alt', icon: null },
    shift: { label: 'Shift', icon: ArrowBigUp },
    delete: { label: 'Delete', icon: Delete },
  },
};

function getShortcutGroups(isMac: boolean): ShortcutGroup[] {
  const keys = isMac ? keyMappings.mac : keyMappings.other;

  return [
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Clear selection / Close modal' },
      ],
    },
    {
      title: 'Tabs',
      shortcuts: [
        { keys: ['Tab'], description: 'Next tab' },
        { keys: [keys.shift.label, 'Tab'], description: 'Previous tab' },
        { keys: [keys.mod.label, 'E'], description: 'Search and open table' },
        { keys: [keys.mod.label, 'J'], description: 'New query tab' },
        { keys: ['W'], description: 'Close active tab' },
      ],
    },
    {
      title: 'Data Operations',
      shortcuts: [
        { keys: [keys.mod.label, 'S'], description: 'Save pending changes' },
        { keys: [keys.mod.label, 'N'], description: 'Add new row' },
        { keys: [keys.delete.label], description: 'Delete selected rows' },
      ],
    },
    {
      title: 'Cell Selection & Copy',
      shortcuts: [
        { keys: ['Click'], description: 'Edit cell' },
        {
          keys: [keys.mod.label, 'Click'],
          description: 'Toggle cell selection',
        },
        {
          keys: [keys.shift.label, 'Click'],
          description: 'Select range of cells',
        },
        { keys: [keys.alt.label, 'Click'], description: 'Copy cell value' },
        { keys: [keys.mod.label, 'C'], description: 'Copy selected cells' },
      ],
    },
    {
      title: 'Row Selection',
      shortcuts: [
        { keys: ['Checkbox'], description: 'Toggle row selection' },
        {
          keys: [keys.shift.label, 'Checkbox'],
          description: 'Select range of rows',
        },
      ],
    },
  ];
}

function KeyBadge({ keyName, isMac }: { keyName: string; isMac: boolean }) {
  const keys = isMac ? keyMappings.mac : keyMappings.other;

  // Check if this key has an icon
  let IconComponent: typeof Command | null = null;

  if (keyName === keys.mod.label && keys.mod.icon) {
    IconComponent = keys.mod.icon;
  } else if (keyName === keys.alt.label && keys.alt.icon) {
    IconComponent = keys.alt.icon;
  } else if (keyName === keys.shift.label && keys.shift.icon) {
    IconComponent = keys.shift.icon;
  } else if (keyName === keys.delete.label && keys.delete.icon) {
    IconComponent = keys.delete.icon;
  }

  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-xs font-medium text-gray-700 dark:text-slate-300 gap-1">
      {IconComponent && <IconComponent size={14} />}
      {/* Hide text for icon-only keys on Mac, show for others */}
      {(!IconComponent ||
        !isMac ||
        keyName === keys.shift.label ||
        keyName === keys.delete.label) && <span>{keyName}</span>}
    </kbd>
  );
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Detect if user is on Mac
  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }, []);

  const shortcutGroups = useMemo(() => getShortcutGroups(isMac), [isMac]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span
                            key={keyIndex}
                            className="flex items-center gap-1"
                          >
                            {keyIndex > 0 && (
                              <span className="text-gray-400 dark:text-slate-500 text-xs">
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
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-500 text-center">
              Press <KeyBadge keyName="?" isMac={isMac} /> anytime to show this
              help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
