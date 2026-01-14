'use client';

import { useState, useEffect, useRef } from 'react';
import type { ColumnInfo } from '@/lib/db-types';
import { X, Key, Link as LinkIcon, WrapText } from 'lucide-react';

interface RowDetailModalProps {
  isOpen: boolean;
  schema: string;
  table: string;
  columns: ColumnInfo[];
  rowData: Record<string, unknown>;
  primaryKeyColumns: string[];
  highlightField?: string | null;
  onClose: () => void;
  onApply: (changes: Record<string, unknown>) => void;
}

export function RowDetailModal({
  isOpen,
  schema,
  table,
  columns,
  rowData,
  primaryKeyColumns,
  highlightField,
  onClose,
  onApply,
}: RowDetailModalProps) {
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reset edited data when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedData({ ...rowData });
    }
  }, [isOpen, rowData]);

  // Handle highlight field - scroll to it and animate
  useEffect(() => {
    if (isOpen && highlightField) {
      setHighlightedField(highlightField);

      // Scroll to field after a brief delay to let modal render
      setTimeout(() => {
        const fieldRef = fieldRefs.current[highlightField];
        if (fieldRef) {
          fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Remove highlight after 1 second
      const timer = setTimeout(() => {
        setHighlightedField(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, highlightField]);

  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (column: string, value: unknown) => {
    setEditedData((prev) => ({ ...prev, [column]: value }));
  };

  const handleApply = () => {
    // Only return changed values
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(editedData)) {
      if (value !== rowData[key]) {
        changes[key] = value;
      }
    }
    onApply(changes);
    onClose();
  };

  const hasChanges = Object.keys(editedData).some(
    (key) => editedData[key] !== rowData[key],
  );

  // Get primary key display
  const primaryKeyDisplay = primaryKeyColumns
    .map((col) => `${col} = ${String(rowData[col])}`)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Row Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {schema}.{table} &bull; {primaryKeyDisplay}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {columns.map((column) => {
            const isPrimaryKey = primaryKeyColumns.includes(column.name);
            const isReadOnly =
              isPrimaryKey || Boolean(column.default?.includes('nextval'));
            const value = editedData[column.name];
            const isHighlighted = highlightedField === column.name;

            return (
              <div
                key={column.name}
                ref={(el) => {
                  fieldRefs.current[column.name] = el;
                }}
                className={`space-y-1 p-2 -mx-2 rounded transition-all duration-300 ${
                  isHighlighted ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : ''
                }`}
              >
                {/* Label */}
                <div className="flex items-center gap-2">
                  {isPrimaryKey && (
                    <span title="Primary Key">
                      <Key size={12} className="text-yellow-500" />
                    </span>
                  )}
                  {column.foreignKey && (
                    <span
                      title={`FK: ${column.foreignKey.table}.${column.foreignKey.column}`}
                    >
                      <LinkIcon size={12} className="text-blue-500" />
                    </span>
                  )}
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {column.name}
                  </label>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    ({column.type})
                  </span>
                  {!column.nullable && !isReadOnly && (
                    <span className="text-red-500 dark:text-red-400 text-xs">
                      *
                    </span>
                  )}
                </div>

                {/* Input */}
                <FieldEditor
                  column={column}
                  value={value}
                  onChange={(newValue) =>
                    handleFieldChange(column.name, newValue)
                  }
                  isReadOnly={isReadOnly}
                />

                {/* Hint */}
                {isReadOnly && (
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    {isPrimaryKey
                      ? 'Primary key (read-only)'
                      : 'Auto-generated (read-only)'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Field editor based on column type
interface FieldEditorProps {
  column: ColumnInfo;
  value: unknown;
  onChange: (value: unknown) => void;
  isReadOnly: boolean;
}

function FieldEditor({
  column,
  value,
  onChange,
  isReadOnly,
}: FieldEditorProps) {
  const type = column.udtName;
  const baseClass =
    'w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed';

  // Boolean
  if (type === 'bool' || type === 'boolean') {
    return (
      <select
        value={value === null ? 'null' : String(value)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === 'null' ? null : v === 'true');
        }}
        disabled={isReadOnly}
        className={baseClass}
      >
        <option value="true">true</option>
        <option value="false">false</option>
        <option value="null">NULL</option>
      </select>
    );
  }

  // JSON
  if (type === 'json' || type === 'jsonb') {
    return (
      <JsonFieldEditor
        value={value}
        onChange={onChange}
        isReadOnly={isReadOnly}
        baseClass={baseClass}
      />
    );
  }

  // Long text
  if (type === 'text') {
    return (
      <textarea
        value={value === null ? '' : String(value)}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : e.target.value)
        }
        disabled={isReadOnly}
        className={`${baseClass} h-24 resize-y`}
        placeholder="NULL"
      />
    );
  }

  // Number
  if (
    [
      'int2',
      'int4',
      'int8',
      'integer',
      'bigint',
      'numeric',
      'real',
      'float4',
      'float8',
    ].includes(type)
  ) {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={value === null ? '' : String(value)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') {
            onChange(null);
          } else {
            const num = parseFloat(v);
            if (!isNaN(num)) {
              onChange(num);
            }
          }
        }}
        disabled={isReadOnly}
        className={baseClass}
        placeholder="NULL"
      />
    );
  }

  // Default: text input
  return (
    <input
      type="text"
      value={value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      disabled={isReadOnly}
      className={baseClass}
      placeholder="NULL"
    />
  );
}

// Separate component for JSON editing to properly use hooks
interface JsonFieldEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  isReadOnly: boolean;
  baseClass: string;
}

function JsonFieldEditor({
  value,
  onChange,
  isReadOnly,
  baseClass,
}: JsonFieldEditorProps) {
  const [jsonStr, setJsonStr] = useState(() => {
    if (value === null || value === undefined) return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  });
  const [error, setError] = useState<string | null>(null);

  // Sync with external value changes
  useEffect(() => {
    if (value === null || value === undefined) {
      setJsonStr('');
    } else {
      try {
        setJsonStr(JSON.stringify(value, null, 2));
      } catch {
        setJsonStr('');
      }
    }
    setError(null);
  }, [value]);

  const handleJsonChange = (str: string) => {
    setJsonStr(str);
    if (str === '') {
      setError(null);
      onChange(null);
    } else {
      try {
        const parsed = JSON.parse(str);
        setError(null);
        onChange(parsed);
      } catch {
        setError('Invalid JSON');
      }
    }
  };

  const handleReformat = () => {
    if (jsonStr === '') return;
    try {
      const parsed = JSON.parse(jsonStr);
      setJsonStr(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      // Keep current string if invalid
    }
  };

  return (
    <div className="relative">
      <textarea
        value={jsonStr}
        onChange={(e) => handleJsonChange(e.target.value)}
        disabled={isReadOnly}
        className={`${baseClass} font-mono font-normal text-xs text-gray-700 dark:text-slate-300 h-32 resize-y`}
        placeholder="null"
      />
      {!isReadOnly && (
        <button
          type="button"
          onClick={handleReformat}
          className="absolute top-2 right-2 p-1.5 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Reformat JSON"
        >
          <WrapText size={14} />
        </button>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
