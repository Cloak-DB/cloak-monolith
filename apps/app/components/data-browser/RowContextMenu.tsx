'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  Edit,
  Copy,
  Trash2,
  Scissors,
  Clipboard,
  CircleSlash,
  FileText,
  Save,
  Undo2,
} from 'lucide-react';

interface RowContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  // Cell-level operations
  cellColumn?: string | null;
  cellValue?: unknown;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onSetNull?: () => void;
  onSetEmptyString?: () => void;
  canPaste?: boolean;
  // Cell-specific pending change operations
  hasCellPendingChange?: boolean;
  onSaveCellChange?: () => void;
  onDiscardCellChange?: () => void;
  isSaving?: boolean;
}

export function RowContextMenu({
  isOpen,
  position,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  canDelete,
  cellColumn,
  cellValue,
  onCopy,
  onCut,
  onPaste,
  onSetNull,
  onSetEmptyString,
  canPaste,
  hasCellPendingChange,
  onSaveCellChange,
  onDiscardCellChange,
  isSaving,
}: RowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Measure menu and adjust position to keep it on screen
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const padding = 8; // Keep some padding from edges

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position if menu goes off right edge
    if (x + menuRect.width > window.innerWidth - padding) {
      x = window.innerWidth - menuRect.width - padding;
    }
    // Don't let it go off left edge either
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position if menu goes off bottom edge
    if (y + menuRect.height > window.innerHeight - padding) {
      // Try to show above the click point
      y = position.y - menuRect.height;
      // If that goes off top, just align to bottom of viewport
      if (y < padding) {
        y = window.innerHeight - menuRect.height - padding;
      }
    }
    // Don't let it go off top edge
    if (y < padding) {
      y = padding;
    }

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const hasCellOperations = cellColumn !== null && cellColumn !== undefined;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Cell-level operations */}
      {hasCellOperations && (
        <>
          <div className="px-3 py-1 text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider">
            Cell: {cellColumn}
          </div>
          <button
            onClick={() => {
              onCopy?.();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
          >
            <Copy size={14} />
            Copy
          </button>
          <button
            onClick={() => {
              onCut?.();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
          >
            <Scissors size={14} />
            Cut
          </button>
          <button
            onClick={() => {
              onPaste?.();
              onClose();
            }}
            disabled={!canPaste}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clipboard size={14} />
            Paste
          </button>
          <button
            onClick={() => {
              onSetNull?.();
              onClose();
            }}
            disabled={cellValue === null}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CircleSlash size={14} />
            Set as NULL
          </button>
          <button
            onClick={() => {
              onSetEmptyString?.();
              onClose();
            }}
            disabled={cellValue === ''}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={14} />
            Set as empty string
          </button>
          <div className="my-1 border-t border-gray-200 dark:border-slate-700" />
        </>
      )}

      {/* Row-level operations */}
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
      >
        <Edit size={14} />
        Edit row details
      </button>
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
      >
        <Copy size={14} />
        Duplicate row
      </button>
      <div className="my-1 border-t border-gray-200 dark:border-slate-700" />
      <button
        onClick={() => {
          if (canDelete) {
            onDelete();
            onClose();
          }
        }}
        disabled={!canDelete}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          !canDelete ? 'Save or discard changes before deleting' : undefined
        }
      >
        <Trash2 size={14} />
        Delete row
      </button>

      {/* Cell-specific pending change operations */}
      {hasCellPendingChange && (
        <>
          <div className="my-1 border-t border-gray-200 dark:border-slate-700" />
          <div className="px-3 py-1 text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
            Cell modified
          </div>
          <button
            onClick={() => {
              onSaveCellChange?.();
              onClose();
            }}
            disabled={isSaving}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save this cell'}
          </button>
          <button
            onClick={() => {
              onDiscardCellChange?.();
              onClose();
            }}
            disabled={isSaving}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo2 size={14} />
            Discard this cell
          </button>
        </>
      )}
    </div>
  );
}
