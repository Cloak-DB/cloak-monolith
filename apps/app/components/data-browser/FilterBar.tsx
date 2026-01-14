'use client';

import { useState, useCallback } from 'react';
import type { ColumnInfo, Filter, FilterOperator } from '@/lib/db-types';
import { generateSelectSQL } from '@/lib/sql-utils';
import { X, Plus, Search, Copy, Check, Pencil } from 'lucide-react';

interface FilterBarProps {
  columns: ColumnInfo[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  // For SQL generation
  schema: string;
  table: string;
  orderBy?: { column: string; direction: 'asc' | 'desc' };
  // Fuzzy search (current page only)
  fuzzyQuery: string;
  onFuzzyQueryChange: (query: string) => void;
}

// Operator display labels (more readable)
const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: '=',
  neq: '\u2260', // ≠
  gt: '>',
  gte: '\u2265', // ≥
  lt: '<',
  lte: '\u2264', // ≤
  like: 'contains',
  ilike: 'contains',
  is_null: 'is empty',
  is_not_null: 'is set',
};

// Operators available per column type
const OPERATORS_BY_TYPE: Record<string, FilterOperator[]> = {
  text: ['eq', 'neq', 'ilike', 'is_null', 'is_not_null'],
  varchar: ['eq', 'neq', 'ilike', 'is_null', 'is_not_null'],
  char: ['eq', 'neq', 'ilike', 'is_null', 'is_not_null'],
  integer: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  int4: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  int8: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  bigint: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  numeric: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  real: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  float4: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  float8: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  timestamp: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  timestamptz: [
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'is_null',
    'is_not_null',
  ],
  date: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  boolean: ['eq', 'is_null', 'is_not_null'],
  bool: ['eq', 'is_null', 'is_not_null'],
  uuid: ['eq', 'neq', 'is_null', 'is_not_null'],
  json: ['is_null', 'is_not_null'],
  jsonb: ['is_null', 'is_not_null'],
};

function getOperatorsForType(udtName: string): FilterOperator[] {
  return OPERATORS_BY_TYPE[udtName] ?? ['eq', 'neq', 'is_null', 'is_not_null'];
}

// Operator chip button component
interface OperatorChipProps {
  operator: FilterOperator;
  isSelected: boolean;
  onClick: () => void;
}

function OperatorChip({ operator, isSelected, onClick }: OperatorChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded border transition-colors ${
        isSelected
          ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
          : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500'
      }`}
    >
      {OPERATOR_LABELS[operator]}
    </button>
  );
}

// Filter editor component (used for both adding and editing)
interface FilterEditorProps {
  columns: ColumnInfo[];
  initialColumn?: string;
  initialOperator?: FilterOperator;
  initialValue?: string;
  onSave: (filter: Filter) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

function FilterEditor({
  columns,
  initialColumn,
  initialOperator,
  initialValue,
  onSave,
  onCancel,
  isEditing = false,
}: FilterEditorProps) {
  const [column, setColumn] = useState(initialColumn ?? columns[0]?.name ?? '');
  const [operator, setOperator] = useState<FilterOperator>(
    initialOperator ?? 'eq',
  );
  const [value, setValue] = useState(initialValue ?? '');

  const selectedColumn = columns.find((c) => c.name === column);
  const operators = selectedColumn
    ? getOperatorsForType(selectedColumn.udtName)
    : ['eq'];
  const needsValue = operator !== 'is_null' && operator !== 'is_not_null';

  const handleColumnChange = (newColumn: string) => {
    setColumn(newColumn);
    // Reset operator if not available for new column type
    const newColumnInfo = columns.find((c) => c.name === newColumn);
    const newOperators = newColumnInfo
      ? getOperatorsForType(newColumnInfo.udtName)
      : ['eq'];
    if (!newOperators.includes(operator)) {
      setOperator(newOperators[0] as FilterOperator);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      column,
      operator,
      value: needsValue ? value : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Column selector */}
        <select
          value={column}
          onChange={(e) => handleColumnChange(e.target.value)}
          disabled={isEditing}
          className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
        >
          {columns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>

        {/* Value input */}
        {needsValue && (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value..."
            autoFocus
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 flex-1 max-w-xs"
          />
        )}

        {/* Action buttons */}
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm px-3 py-1.5 rounded"
        >
          {isEditing ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 text-sm px-2 py-1.5"
        >
          Cancel
        </button>
      </div>

      {/* Operator chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-slate-500 mr-1">
          Operator:
        </span>
        {operators.map((op) => (
          <OperatorChip
            key={op}
            operator={op as FilterOperator}
            isSelected={operator === op}
            onClick={() => setOperator(op as FilterOperator)}
          />
        ))}
      </div>
    </form>
  );
}

// Active filter badge component
interface ActiveFilterProps {
  filter: Filter;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

function ActiveFilter({ filter, onEdit, onRemove }: ActiveFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs px-2 py-1 rounded group">
      <span className="font-medium">{filter.column}</span>
      <span className="text-gray-500 dark:text-slate-400">
        {OPERATOR_LABELS[filter.operator]}
      </span>
      {filter.value !== undefined && (
        <span className="text-yellow-600 dark:text-yellow-400">
          "{String(filter.value)}"
        </span>
      )}
      <button
        onClick={onEdit}
        className="ml-1 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit filter"
      >
        <Pencil size={10} />
      </button>
      <button
        onClick={onRemove}
        className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200"
        title="Remove filter"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function FilterBar({
  columns,
  filters,
  onFiltersChange,
  schema,
  table,
  orderBy,
  fuzzyQuery,
  onFuzzyQueryChange,
}: FilterBarProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddFilter = useCallback(
    (filter: Filter) => {
      onFiltersChange([...filters, filter]);
      setShowBuilder(false);
    },
    [filters, onFiltersChange],
  );

  const handleUpdateFilter = useCallback(
    (index: number, filter: Filter) => {
      const newFilters = [...filters];
      newFilters[index] = filter;
      onFiltersChange(newFilters);
      setEditingIndex(null);
    },
    [filters, onFiltersChange],
  );

  const handleRemoveFilter = useCallback(
    (index: number) => {
      onFiltersChange(filters.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    },
    [filters, onFiltersChange, editingIndex],
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange([]);
    onFuzzyQueryChange('');
    setEditingIndex(null);
  }, [onFiltersChange, onFuzzyQueryChange]);

  const handleCopySQL = useCallback(async () => {
    const sql = generateSelectSQL(schema, table, { filters, orderBy });
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  }, [schema, table, filters, orderBy]);

  const editingFilter = editingIndex !== null ? filters[editingIndex] : null;

  return (
    <div className="border-b border-gray-200 dark:border-slate-700">
      {/* Main filter bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-800/50">
        {/* Fuzzy search (current page only) */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={fuzzyQuery}
            onChange={(e) => onFuzzyQueryChange(e.target.value)}
            placeholder="Search this page..."
            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

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

        <div className="h-4 w-px bg-gray-300 dark:bg-slate-700" />

        {/* Add filter button */}
        <button
          onClick={() => {
            setShowBuilder(!showBuilder);
            setEditingIndex(null);
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
        >
          <Plus size={16} />
          Add Filter
        </button>

        {/* Active filters */}
        {filters.length > 0 && (
          <>
            <div className="h-4 w-px bg-gray-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((filter, index) => (
                <ActiveFilter
                  key={index}
                  filter={filter}
                  index={index}
                  onEdit={() => {
                    setEditingIndex(index);
                    setShowBuilder(false);
                  }}
                  onRemove={() => handleRemoveFilter(index)}
                />
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
              >
                Clear all
              </button>
            </div>
          </>
        )}
      </div>

      {/* New filter builder */}
      {showBuilder && (
        <FilterEditor
          columns={columns}
          onSave={handleAddFilter}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      {/* Edit existing filter */}
      {editingFilter && editingIndex !== null && (
        <FilterEditor
          columns={columns}
          initialColumn={editingFilter.column}
          initialOperator={editingFilter.operator}
          initialValue={
            editingFilter.value !== undefined ? String(editingFilter.value) : ''
          }
          onSave={(filter) => handleUpdateFilter(editingIndex, filter)}
          onCancel={() => setEditingIndex(null)}
          isEditing
        />
      )}
    </div>
  );
}
