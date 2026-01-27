'use client';

import { useMemo } from 'react';
import { Plus, X, Command } from 'lucide-react';
import type { Filter } from '@/lib/db-types';
import { FilterChip } from './FilterChip';
import { ALL_COLUMNS_KEY } from './filter-utils';

interface FilterChipsBarProps {
  filters: Filter[];
  focusedChipIndex: number | null;
  visibleRowCount?: number;
  totalRowCount?: number;
  onAddClick: () => void;
  onEditFilter: (filter: Filter, index: number) => void;
  onRemoveFilter: (index: number) => void;
  onFocusChip: (index: number) => void;
  onClearAll: () => void;
}

export function FilterChipsBar({
  filters,
  focusedChipIndex,
  visibleRowCount,
  totalRowCount,
  onAddClick,
  onEditFilter,
  onRemoveFilter,
  onFocusChip,
  onClearAll,
}: FilterChipsBarProps) {
  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Add filter button */}
      <button
        onClick={onAddClick}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
        title={`Add filter (${isMac ? 'Cmd' : 'Ctrl'}+F)`}
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Filter</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded">
          {isMac ? <Command size={10} /> : <span>Ctrl+</span>}
          <span>F</span>
        </kbd>
      </button>

      {/* Filter chips */}
      {filters.length > 0 && (
        <>
          <div className="h-4 w-px bg-gray-300 dark:bg-slate-700" />

          {filters.map((filter, index) => (
            <FilterChip
              key={`${filter.column}-${index}`}
              filter={filter}
              index={index}
              isFocused={focusedChipIndex === index}
              visibleRowCount={
                filter.column === ALL_COLUMNS_KEY ? visibleRowCount : undefined
              }
              totalRowCount={
                filter.column === ALL_COLUMNS_KEY ? totalRowCount : undefined
              }
              onEdit={() => onEditFilter(filter, index)}
              onRemove={() => onRemoveFilter(index)}
              onFocus={() => onFocusChip(index)}
            />
          ))}

          {/* Clear all button */}
          {filters.length > 1 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Clear all filters"
            >
              <X size={12} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </>
      )}

      {/* Focused chip hint */}
      {focusedChipIndex !== null && (
        <div className="text-xs text-gray-400 dark:text-slate-500 ml-2">
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">
            m
          </kbd>
          <span className="mx-1">edit</span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">
            ⌫
          </kbd>
          <span className="mx-1">delete</span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">
            esc
          </kbd>
          <span className="ml-1">unfocus</span>
        </div>
      )}
    </div>
  );
}
