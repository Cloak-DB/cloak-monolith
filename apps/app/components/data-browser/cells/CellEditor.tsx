'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ColumnInfo } from '@/lib/db-types';
import { Maximize2 } from 'lucide-react';

interface CellEditorProps {
  column: ColumnInfo;
  value: unknown;
  onChange: (value: unknown) => void;
  onCommit: () => void;
  onCancel: () => void;
  onExpand?: () => void;
}

export function CellEditor({
  column,
  value,
  onChange,
  onCommit,
  onCancel,
  onExpand,
}: CellEditorProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onCommit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        // Let tab propagate for cell navigation
        onCommit();
      }
    },
    [onCommit, onCancel],
  );

  const type = column.udtName;

  // Boolean toggle
  if (type === 'bool' || type === 'boolean') {
    return (
      <BooleanEditor
        value={value as boolean | null}
        onChange={onChange}
        onCommit={onCommit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  // Number input
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
      'double precision',
    ].includes(type)
  ) {
    return (
      <NumberEditor
        value={value as number | null}
        onChange={onChange}
        onCommit={onCommit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  // JSON - show expand button
  if (type === 'json' || type === 'jsonb') {
    return (
      <div className="flex items-center gap-1">
        <code className="text-xs text-gray-500 dark:text-slate-400 truncate flex-1">
          {value ? JSON.stringify(value).slice(0, 30) + '...' : 'null'}
        </code>
        <button
          onClick={onExpand}
          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
          title="Edit in modal"
        >
          <Maximize2 size={12} className="text-gray-500 dark:text-slate-400" />
        </button>
      </div>
    );
  }

  // Long text - show with expand option
  if (type === 'text') {
    const strValue = value as string | null;
    const isLong = Boolean(strValue && strValue.length > 100);

    return (
      <div className="flex items-center gap-1">
        <TextEditor
          value={strValue}
          onChange={onChange}
          onCommit={onCommit}
          onKeyDown={handleKeyDown}
          multiline={isLong}
        />
        {isLong && (
          <button
            onClick={onExpand}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded flex-shrink-0"
            title="Edit in modal"
          >
            <Maximize2
              size={12}
              className="text-gray-500 dark:text-slate-400"
            />
          </button>
        )}
      </div>
    );
  }

  // Default: text input
  return (
    <TextEditor
      value={value as string | null}
      onChange={onChange}
      onCommit={onCommit}
      onKeyDown={handleKeyDown}
    />
  );
}

// Text Editor
interface TextEditorProps {
  value: string | null;
  onChange: (value: unknown) => void;
  onCommit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  multiline?: boolean;
}

function TextEditor({
  value,
  onChange,
  onCommit,
  onKeyDown,
  multiline,
}: TextEditorProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue === '' ? null : newValue);
  };

  const handleBlur = () => {
    onCommit();
  };

  const className =
    'w-full h-full bg-white dark:bg-slate-700 border-2 border-yellow-500 text-gray-900 dark:text-slate-200 text-sm px-3 py-2 focus:outline-none';

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        className={`${className} resize-none min-h-[40px]`}
        rows={2}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      className={className}
    />
  );
}

// Number Editor
interface NumberEditorProps {
  value: number | null;
  onChange: (value: unknown) => void;
  onCommit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function NumberEditor({
  value,
  onChange,
  onCommit,
  onKeyDown,
}: NumberEditorProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (newValue === '') {
      onChange(null);
    } else {
      const num = parseFloat(newValue);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    onCommit();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      className="w-full h-full bg-white dark:bg-slate-700 border-2 border-yellow-500 text-gray-900 dark:text-slate-200 text-sm px-3 py-2 focus:outline-none"
    />
  );
}

// Boolean Editor
interface BooleanEditorProps {
  value: boolean | null;
  onChange: (value: unknown) => void;
  onCommit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function BooleanEditor({
  value,
  onChange,
  onCommit,
  onKeyDown,
}: BooleanEditorProps) {
  const options = [
    { label: 'true', value: true },
    { label: 'false', value: false },
    { label: 'NULL', value: null },
  ];

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'null') {
      onChange(null);
    } else {
      onChange(selected === 'true');
    }
    onCommit();
  };

  return (
    <select
      ref={selectRef}
      value={value === null ? 'null' : value.toString()}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onBlur={onCommit}
      className="w-full h-full bg-white dark:bg-slate-700 border-2 border-yellow-500 text-gray-900 dark:text-slate-200 text-sm px-3 py-2 focus:outline-none"
    >
      {options.map((opt) => (
        <option
          key={String(opt.value)}
          value={opt.value === null ? 'null' : opt.value.toString()}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
