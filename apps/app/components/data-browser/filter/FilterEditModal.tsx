'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from '@cloak-db/ui/components/modal';
import { Button } from '@cloak-db/ui/components/button';
import type { ColumnInfo, Filter, FilterOperator } from '@/lib/db-types';
import {
  OPERATOR_LABELS,
  getOperatorsForType,
  operatorNeedsValue,
  isAllColumnsOption,
  getColumnDisplayName,
  ALL_COLUMNS_KEY,
  ALL_COLUMNS_OPTION,
} from './filter-utils';

interface FilterEditModalProps {
  isOpen: boolean;
  filter: Filter;
  columns: ColumnInfo[];
  onSave: (filter: Filter) => void;
  onCancel: () => void;
}

export function FilterEditModal({
  isOpen,
  filter,
  columns,
  onSave,
  onCancel,
}: FilterEditModalProps) {
  const [operator, setOperator] = useState<FilterOperator>(filter.operator);
  const [value, setValue] = useState(
    filter.value !== undefined ? String(filter.value) : '',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const isAllColumns = filter.column === ALL_COLUMNS_KEY;
  const columnInfo = isAllColumns
    ? null
    : columns.find((c) => c.name === filter.column);

  const operators: FilterOperator[] = isAllColumns
    ? ['ilike']
    : columnInfo
      ? getOperatorsForType(columnInfo.udtName)
      : ['eq', 'neq', 'is_null', 'is_not_null'];

  const needsValue = operatorNeedsValue(operator);

  // Reset state when filter changes
  useEffect(() => {
    setOperator(filter.operator);
    setValue(filter.value !== undefined ? String(filter.value) : '');
  }, [filter]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && needsValue) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, needsValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsValue && !value.trim()) return;

    onSave({
      column: filter.column,
      operator,
      value: needsValue ? value : undefined,
    });
  };

  const displayColumnName = isAllColumns
    ? 'All columns'
    : (columnInfo?.name ?? filter.column);

  return (
    <Modal open={isOpen} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Edit Filter</ModalTitle>
        </ModalHeader>

        <ModalContent>
          <div className="space-y-4">
            {/* Column (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Column
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300 text-sm">
                {displayColumnName}
              </div>
            </div>

            {/* Operator (hide for All columns) */}
            {!isAllColumns && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Operator
                </label>
                <div className="flex flex-wrap gap-2">
                  {operators.map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                        operator === op
                          ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                          : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500'
                      }`}
                    >
                      {OPERATOR_LABELS[op]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Value */}
            {needsValue && (
              <div>
                <label
                  htmlFor="filter-value"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                >
                  Value
                </label>
                <input
                  ref={inputRef}
                  id="filter-value"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="yellow"
            disabled={needsValue && !value.trim()}
          >
            Save
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
