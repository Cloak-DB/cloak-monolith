'use client';

import { useEffect, useRef } from 'react';
import { Table2, Columns3 } from 'lucide-react';
import type { ColumnInfo } from '@/lib/db-types';
import {
  type ColumnOption,
  isAllColumnsOption,
  getColumnDisplayName,
} from './filter-utils';

interface ColumnSuggestionsProps {
  filteredOptions: ColumnOption[];
  selectedIndex: number;
  onSelect: (column: ColumnOption) => void;
}

export function ColumnSuggestions({
  filteredOptions,
  selectedIndex,
  onSelect,
}: ColumnSuggestionsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (filteredOptions.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-gray-500 dark:text-slate-500 text-sm">
        No columns found
      </div>
    );
  }

  return (
    <div ref={listRef} className="max-h-[240px] overflow-y-auto">
      {filteredOptions.map((col, index) => {
        const isAllColumns = isAllColumnsOption(col);
        const displayName = getColumnDisplayName(col);

        return (
          <button
            key={col.name}
            onClick={() => onSelect(col)}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
              ${
                index === selectedIndex
                  ? 'bg-yellow-500/20 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }
            `}
          >
            {isAllColumns ? (
              <Columns3
                size={16}
                className="text-yellow-500 dark:text-yellow-400 flex-shrink-0"
              />
            ) : (
              <Table2
                size={16}
                className="text-gray-400 dark:text-slate-500 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className={isAllColumns ? 'font-medium' : ''}>
                {displayName}
              </span>
            </div>
            {!isAllColumns && (
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {(col as ColumnInfo).udtName}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { type ColumnOption };
