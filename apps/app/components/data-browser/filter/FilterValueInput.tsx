'use client';

import { useState, useRef, useEffect } from 'react';
import type { ColumnInfo, Filter, FilterOperator } from '@/lib/db-types';
import {
  OPERATOR_LABELS,
  getOperatorsForType,
  getDefaultOperatorForType,
  operatorNeedsValue,
  isAllColumnsOption,
  getColumnDisplayName,
  type ColumnOption,
  ALL_COLUMNS_KEY,
} from './filter-utils';

interface FilterValueInputProps {
  column: ColumnOption;
  onApply: (filter: Filter) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function FilterValueInput({
  column,
  onApply,
  onBack,
  onCancel,
}: FilterValueInputProps) {
  const isAllColumns = isAllColumnsOption(column);
  const columnInfo = isAllColumns ? null : (column as ColumnInfo);

  // For "All columns", use a special 'fuzzy' operator type
  const operators: FilterOperator[] = isAllColumns
    ? ['ilike']
    : getOperatorsForType(columnInfo!.udtName);

  const [operator, setOperator] = useState<FilterOperator>(
    isAllColumns ? 'ilike' : getDefaultOperatorForType(columnInfo!.udtName),
  );
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const needsValue = operatorNeedsValue(operator);

  // Focus input on mount
  useEffect(() => {
    if (needsValue) {
      inputRef.current?.focus();
    }
  }, [needsValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsValue && !value.trim()) return;

    onApply({
      column: column.name,
      operator: isAllColumns ? 'ilike' : operator,
      value: needsValue ? value : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value) {
      e.preventDefault();
      onBack();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="p-3">
      {/* Column name badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 dark:text-slate-500">
          Filter by:
        </span>
        <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm rounded font-medium">
          {getColumnDisplayName(column)}
        </span>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        >
          Change
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Operator selector (hide for All columns since it's always fuzzy/contains) */}
        {!isAllColumns && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-slate-500">
              Operator:
            </span>
            {operators.map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperator(op)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  operator === op
                    ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                    : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500'
                }`}
              >
                {OPERATOR_LABELS[op]}
              </button>
            ))}
          </div>
        )}

        {/* Value input */}
        {needsValue && (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAllColumns ? 'Search all columns...' : 'Enter value...'
              }
              className="flex-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-medium text-sm px-3 py-1.5 rounded transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        {/* For operators that don't need value (is_null, is_not_null) */}
        {!needsValue && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm px-3 py-1.5 rounded"
            >
              Apply
            </button>
          </div>
        )}
      </form>

      {/* Footer hint */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">
              Enter
            </kbd>{' '}
            apply
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">
              Backspace
            </kbd>{' '}
            change column
          </span>
        </div>
      </div>
    </div>
  );
}
