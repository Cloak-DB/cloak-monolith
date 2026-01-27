'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { ColumnInfo, Filter } from '@/lib/db-types';
import { fuzzySearchItems } from '@/lib/fuzzy-search';
import { ColumnSuggestions, type ColumnOption } from './ColumnSuggestions';
import { FilterValueInput } from './FilterValueInput';
import { ALL_COLUMNS_OPTION, getColumnDisplayName } from './filter-utils';

type PopoverStage = 'column-search' | 'value-input';

interface FilterPopoverProps {
  isOpen: boolean;
  columns: ColumnInfo[];
  onApply: (filter: Filter) => void;
  onClose: () => void;
}

export function FilterPopover({
  isOpen,
  columns,
  onApply,
  onClose,
}: FilterPopoverProps) {
  const [stage, setStage] = useState<PopoverStage>('column-search');
  const [columnQuery, setColumnQuery] = useState('');
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState<ColumnOption | null>(
    null,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Build options list with "All columns" first
  const allOptions: ColumnOption[] = useMemo(() => {
    return [ALL_COLUMNS_OPTION, ...columns];
  }, [columns]);

  // Fuzzy filter columns
  const filteredOptions = useMemo(() => {
    if (!columnQuery.trim()) {
      return allOptions;
    }
    return fuzzySearchItems(allOptions, columnQuery, (col) => [
      getColumnDisplayName(col),
    ]);
  }, [allOptions, columnQuery]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStage('column-search');
      setColumnQuery('');
      setSelectedColumnIndex(0);
      setSelectedColumn(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset selection when filtered results change
  useEffect(() => {
    if (selectedColumnIndex >= filteredOptions.length) {
      setSelectedColumnIndex(Math.max(0, filteredOptions.length - 1));
    }
  }, [filteredOptions.length, selectedColumnIndex]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleColumnSelect = useCallback((column: ColumnOption) => {
    setSelectedColumn(column);
    setStage('value-input');
  }, []);

  const handleBack = useCallback(() => {
    setStage('column-search');
    setSelectedColumn(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleApply = useCallback(
    (filter: Filter) => {
      onApply(filter);
      onClose();
    },
    [onApply, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (stage !== 'column-search') return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedColumnIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedColumnIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          // Select the currently highlighted column
          if (
            filteredOptions.length > 0 &&
            selectedColumnIndex < filteredOptions.length
          ) {
            handleColumnSelect(filteredOptions[selectedColumnIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [stage, filteredOptions, selectedColumnIndex, handleColumnSelect, onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      {stage === 'column-search' ? (
        <>
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-slate-700">
            <Search
              size={16}
              className="text-gray-400 dark:text-slate-500 flex-shrink-0"
            />
            <input
              ref={inputRef}
              type="text"
              value={columnQuery}
              onChange={(e) => {
                setColumnQuery(e.target.value);
                setSelectedColumnIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search columns..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none text-sm"
            />
            <kbd className="px-1.5 py-0.5 text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 rounded">
              esc
            </kbd>
          </div>

          {/* Column suggestions */}
          <ColumnSuggestions
            filteredOptions={filteredOptions}
            selectedIndex={selectedColumnIndex}
            onSelect={handleColumnSelect}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500">
            <span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded mr-1">
                ↑↓
              </kbd>
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded mr-1">
                ↵
              </kbd>
              select
            </span>
          </div>
        </>
      ) : (
        selectedColumn && (
          <FilterValueInput
            column={selectedColumn}
            onApply={handleApply}
            onBack={handleBack}
            onCancel={onClose}
          />
        )
      )}
    </div>
  );
}
