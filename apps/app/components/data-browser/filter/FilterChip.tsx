'use client';

import { useMemo } from 'react';
import { X, Pencil, Command } from 'lucide-react';
import type { Filter } from '@/lib/db-types';
import { OPERATOR_LABELS, ALL_COLUMNS_KEY } from './filter-utils';

interface FilterChipProps {
  filter: Filter;
  index: number;
  isFocused: boolean;
  visibleRowCount?: number;
  totalRowCount?: number;
  onEdit: () => void;
  onRemove: () => void;
  onFocus: () => void;
}

export function FilterChip({
  filter,
  index,
  isFocused,
  visibleRowCount,
  totalRowCount,
  onEdit,
  onRemove,
  onFocus,
}: FilterChipProps) {
  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }, []);

  const isAllColumns = filter.column === ALL_COLUMNS_KEY;
  const shortcutNumber = index + 1;
  const hasShortcut = shortcutNumber <= 9;

  // For "All columns" filter, show visible row count
  const showRowCount =
    isAllColumns &&
    visibleRowCount !== undefined &&
    totalRowCount !== undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFocus();
        }
      }}
      className={`
        flex items-center gap-1.5 text-xs px-2 py-1.5 rounded cursor-pointer transition-all
        ${
          isFocused
            ? 'bg-yellow-500 text-black ring-2 ring-yellow-400 ring-offset-1 dark:ring-offset-slate-900'
            : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'
        }
        group
      `}
    >
      {/* Keyboard shortcut indicator */}
      {hasShortcut && (
        <span
          className={`
            inline-flex items-center gap-0.5 text-[10px] font-mono px-1 rounded
            ${
              isFocused
                ? 'bg-yellow-600/30 text-yellow-900'
                : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400'
            }
          `}
        >
          {isMac ? <Command size={9} /> : <span>^</span>}
          {shortcutNumber}
        </span>
      )}

      {/* Column name */}
      <span className="font-medium">
        {isAllColumns ? 'All' : filter.column}
      </span>

      {/* Operator */}
      <span
        className={
          isFocused ? 'text-yellow-800' : 'text-gray-500 dark:text-slate-400'
        }
      >
        {OPERATOR_LABELS[filter.operator]}
      </span>

      {/* Value */}
      {filter.value !== undefined && (
        <span
          className={
            isFocused
              ? 'text-yellow-900'
              : 'text-yellow-600 dark:text-yellow-400'
          }
        >
          "{String(filter.value)}"
        </span>
      )}

      {/* Row count for "All columns" filter */}
      {showRowCount && (
        <span
          className={`
            text-[10px] ml-1
            ${isFocused ? 'text-yellow-800' : 'text-gray-400 dark:text-slate-500'}
          `}
        >
          ({visibleRowCount}/{totalRowCount})
        </span>
      )}

      {/* Edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className={`
          ml-0.5 p-0.5 rounded transition-opacity
          ${
            isFocused
              ? 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-400/50'
              : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100'
          }
        `}
        title="Edit filter (m)"
      >
        <Pencil size={10} />
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={`
          p-0.5 rounded transition-opacity
          ${
            isFocused
              ? 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-400/50'
              : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200'
          }
        `}
        title="Remove filter (Backspace)"
      >
        <X size={12} />
      </button>
    </div>
  );
}
