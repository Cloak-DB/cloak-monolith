'use client';

import { useEffect, useRef } from 'react';
import {
  Edit,
  Copy,
  Trash2,
  Scissors,
  Clipboard,
  CircleSlash,
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
  canPaste?: boolean;
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
  canPaste,
}: RowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Adjust position to prevent menu from going off screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.min(position.y, window.innerHeight - 150),
  };

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
    </div>
  );
}
