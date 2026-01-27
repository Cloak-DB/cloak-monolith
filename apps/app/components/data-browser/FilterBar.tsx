'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ColumnInfo, Filter } from '@/lib/db-types';
import { generateSelectSQL } from '@/lib/sql-utils';
import { Copy, Check, HelpCircle } from 'lucide-react';
import {
  FilterPopover,
  FilterChipsBar,
  FilterEditModal,
  FilterHelpOverlay,
  ALL_COLUMNS_KEY,
} from './filter';
import { useFilterState } from './hooks';

interface FilterBarProps {
  columns: ColumnInfo[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  // For SQL generation
  schema: string;
  table: string;
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  // Visible row count for "All columns" filter
  visibleRowCount?: number;
  totalRowCount?: number;
  // Expose filter state actions for keyboard shortcuts from parent
  filterStateRef?: React.MutableRefObject<{
    openPopover: () => void;
    focusChip: (index: number) => void;
    toggleHelp: () => void;
  } | null>;
}

export function FilterBar({
  columns,
  filters,
  onFiltersChange,
  schema,
  table,
  orderBy,
  visibleRowCount,
  totalRowCount,
  filterStateRef,
}: FilterBarProps) {
  const [copied, setCopied] = useState(false);
  const filterState = useFilterState();
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose filter state actions to parent via ref
  useEffect(() => {
    if (filterStateRef) {
      filterStateRef.current = {
        openPopover: filterState.openPopover,
        focusChip: filterState.focusChip,
        toggleHelp: filterState.toggleHelp,
      };
    }
    return () => {
      if (filterStateRef) {
        filterStateRef.current = null;
      }
    };
  }, [
    filterStateRef,
    filterState.openPopover,
    filterState.focusChip,
    filterState.toggleHelp,
  ]);

  const handleAddFilter = useCallback(
    (filter: Filter) => {
      onFiltersChange([...filters, filter]);
    },
    [filters, onFiltersChange],
  );

  const handleUpdateFilter = useCallback(
    (index: number, filter: Filter) => {
      const newFilters = [...filters];
      newFilters[index] = filter;
      onFiltersChange(newFilters);
      filterState.closeEditModal();
    },
    [filters, onFiltersChange, filterState],
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      onFiltersChange(filters.filter((_, i) => i !== index));
      if (filterState.state.editingFilter?.index === index) {
        filterState.closeEditModal();
      }
      if (filterState.state.focusedChipIndex === index) {
        filterState.unfocusChip();
      } else if (
        filterState.state.focusedChipIndex !== null &&
        filterState.state.focusedChipIndex > index
      ) {
        // Adjust focus index if a chip before it was removed
        filterState.focusChip(filterState.state.focusedChipIndex - 1);
      }
    },
    [filters, onFiltersChange, filterState],
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange([]);
    filterState.closeEditModal();
    filterState.unfocusChip();
  }, [onFiltersChange, filterState]);

  const handleCopySQL = useCallback(async () => {
    // Filter out the special __all__ column from SQL generation
    const sqlFilters = filters.filter((f) => f.column !== ALL_COLUMNS_KEY);
    const sql = generateSelectSQL(schema, table, {
      filters: sqlFilters,
      orderBy,
    });
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  }, [schema, table, filters, orderBy]);

  // Refs to avoid stale closures in keyboard handler
  const filterStateRef2 = useRef(filterState);
  const filtersRef = useRef(filters);
  const handleRemoveFilterRef = useRef(handleRemoveFilter);

  // Keep refs in sync
  useEffect(() => {
    filterStateRef2.current = filterState;
    filtersRef.current = filters;
    handleRemoveFilterRef.current = handleRemoveFilter;
  });

  // Keyboard shortcuts for filter chips (when focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = filterStateRef2.current;
      const currentFilters = filtersRef.current;
      const { focusedChipIndex } = state.state;

      // Only handle when a chip is focused
      if (focusedChipIndex === null) return;

      // Don't intercept if user is typing in an input
      const isTyping =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';
      if (isTyping) return;

      switch (e.key) {
        case 'm':
          // Edit focused filter
          e.preventDefault();
          const filter = currentFilters[focusedChipIndex];
          if (filter) {
            state.openEditModal(filter, focusedChipIndex);
          }
          break;
        case 'Backspace':
        case 'Delete':
          // Delete focused filter
          e.preventDefault();
          handleRemoveFilterRef.current(focusedChipIndex);
          break;
        case 'Escape':
          // Unfocus chip
          e.preventDefault();
          state.unfocusChip();
          break;
        case 'ArrowRight':
          // Move focus to next chip
          e.preventDefault();
          state.focusNextChip(currentFilters.length);
          break;
        case 'ArrowLeft':
          // Move focus to previous chip
          e.preventDefault();
          state.focusPrevChip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="border-b border-gray-200 dark:border-slate-700"
    >
      {/* Main filter bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 relative">
        {/* Filter chips bar */}
        <FilterChipsBar
          filters={filters}
          focusedChipIndex={filterState.state.focusedChipIndex}
          visibleRowCount={visibleRowCount}
          totalRowCount={totalRowCount}
          onAddClick={filterState.togglePopover}
          onEditFilter={(filter, index) =>
            filterState.openEditModal(filter, index)
          }
          onRemoveFilter={handleRemoveFilter}
          onFocusChip={filterState.focusChip}
          onClearAll={handleClearAll}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Copy SQL button */}
        <button
          onClick={handleCopySQL}
          className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          title="Copy SQL query to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden sm:inline">
            {copied ? 'Copied!' : 'Copy SQL'}
          </span>
        </button>

        {/* Help button */}
        <button
          onClick={filterState.toggleHelp}
          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          title="Filter shortcuts (?)"
        >
          <HelpCircle size={16} />
        </button>

        {/* Filter popover */}
        <FilterPopover
          isOpen={filterState.state.isPopoverOpen}
          columns={columns}
          onApply={handleAddFilter}
          onClose={filterState.closePopover}
        />
      </div>

      {/* Edit modal */}
      {filterState.state.editingFilter && (
        <FilterEditModal
          isOpen={true}
          filter={filterState.state.editingFilter.filter}
          columns={columns}
          onSave={(filter) =>
            handleUpdateFilter(filterState.state.editingFilter!.index, filter)
          }
          onCancel={filterState.closeEditModal}
        />
      )}

      {/* Help overlay */}
      <FilterHelpOverlay
        isOpen={filterState.state.isHelpVisible}
        onClose={filterState.hideHelp}
      />
    </div>
  );
}

// Re-export for backward compatibility - expose the filter state hook
export { useFilterState } from './hooks';
