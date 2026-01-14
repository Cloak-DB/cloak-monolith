'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Play,
  AlertCircle,
  AlertTriangle,
  Clock,
  Database,
  Rows3,
  ChevronUp,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Pagination } from '@/components/data-browser/Pagination';
import { fuzzySearchRows } from '@/lib/fuzzy-search';

interface QueryField {
  name: string;
  dataTypeID: number;
  dataTypeName: string;
}

interface QueryResultData {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: QueryField[];
  executionTimeMs: number;
  wasLimited: boolean;
  limit: number;
}

type SortDirection = 'asc' | 'desc' | null;

export function QueryRunner() {
  const [sql, setSql] = useState('SELECT * FROM ');
  const [result, setResult] = useState<QueryResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sqlRef = useRef(sql);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Keep ref in sync with state
  sqlRef.current = sql;

  const executeMutation = trpc.query.execute.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      // Reset pagination, sorting, and search on new query
      setCurrentPage(1);
      setSortColumn(null);
      setSortDirection(null);
      setSearchQuery('');
    },
    onError: (err) => {
      setError(err.message);
      setResult(null);
    },
  });

  // Stable callback - reads sql from ref to avoid re-creating on every keystroke
  const handleExecute = useCallback(() => {
    const currentSql = sqlRef.current;
    if (!currentSql.trim()) return;
    executeMutation.mutate({ sql: currentSql.trim() });
  }, [executeMutation]);

  // Handle keyboard shortcuts on textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter or Ctrl+Enter to execute
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
      // Escape to blur the textarea
      if (e.key === 'Escape') {
        e.stopPropagation(); // Prevent global handler from re-focusing
        textareaRef.current?.blur();
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener('keydown', handleKeyDown);
    return () => textarea?.removeEventListener('keydown', handleKeyDown);
  }, [handleExecute]);

  // Global keyboard shortcut to focus textarea when not in an input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Focus textarea on Escape when not in any input/textarea
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        const isInInput =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement;

        // If not in an input and not already focused on our textarea, focus it
        if (!isInInput && activeElement !== textareaRef.current) {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle column header click for sorting
  const handleSort = useCallback(
    (columnName: string) => {
      if (sortColumn === columnName) {
        // Cycle: asc -> desc -> null
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortColumn(null);
          setSortDirection(null);
        }
      } else {
        setSortColumn(columnName);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortColumn, sortDirection],
  );

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  // Process rows: filter -> sort -> paginate
  const { processedRows, totalFilteredCount } = useMemo(() => {
    if (!result) return { processedRows: [], totalFilteredCount: 0 };

    let rows = result.rows;

    // Apply search filter
    if (searchQuery.trim()) {
      rows = fuzzySearchRows(rows, searchQuery);
    }

    const totalFilteredCount = rows.length;

    // Apply sorting
    if (sortColumn && sortDirection) {
      rows = [...rows].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        // Nulls go last
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Compare values
        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

    return { processedRows: paginatedRows, totalFilteredCount };
  }, [result, searchQuery, sortColumn, sortDirection, currentPage, pageSize]);

  const totalPages = Math.ceil(totalFilteredCount / pageSize);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      {/* SQL Editor Section */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              SQL Query
            </label>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded">
                Cmd
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded">
                Enter
              </kbd>
              <span>to run</span>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Enter your SQL query here..."
            className="w-full h-32 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 font-mono text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-y"
            spellCheck={false}
          />
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={handleExecute}
              disabled={executeMutation.isPending || !sql.trim()}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Play size={16} />
              {executeMutation.isPending ? 'Running...' : 'Run Query'}
            </button>

            {result && (
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Rows3 size={14} />
                  {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {result.executionTimeMs}ms
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="p-4">
            <div className="flex items-start gap-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-4">
              <AlertCircle
                className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-1">
                  Query Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {result?.wasLimited && (
          <div className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                Results limited to {result.limit} rows
              </span>
            </div>
          </div>
        )}

        {result && result.rows.length > 0 && (
          <>
            {/* Search bar */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <div className="relative max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="Search results..."
                  className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Found {totalFilteredCount} matching{' '}
                  {totalFilteredCount === 1 ? 'row' : 'rows'}
                </p>
              )}
            </div>

            {/* Results table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 dark:bg-slate-800 z-10">
                  <tr>
                    {/* Row number column */}
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-500 border-b border-gray-200 dark:border-slate-700 w-12">
                      #
                    </th>
                    {result.fields.map((field) => (
                      <th
                        key={field.name}
                        onClick={() => handleSort(field.name)}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 select-none"
                      >
                        <div className="flex items-center gap-1">
                          <div>
                            <div>{field.name}</div>
                            <div className="font-normal text-gray-500 dark:text-slate-500 normal-case">
                              {field.dataTypeName}
                            </div>
                          </div>
                          {sortColumn === field.name && (
                            <span className="text-yellow-500">
                              {sortDirection === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {processedRows.map((row, rowIndex) => {
                    const rowNumber =
                      (currentPage - 1) * pageSize + rowIndex + 1;
                    return (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        {/* Row number */}
                        <td className="px-3 py-2 text-sm text-gray-400 dark:text-slate-500 font-mono">
                          {rowNumber}
                        </td>
                        {result.fields.map((field) => (
                          <td
                            key={field.name}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 font-mono"
                          >
                            <CellValue value={row[field.name]} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalFilteredCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}

        {result && result.rows.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Database
                size={32}
                className="mx-auto text-gray-400 dark:text-slate-500"
              />
              <p className="text-gray-500 dark:text-slate-400">
                Query executed successfully.
                {result.rowCount > 0
                  ? ` ${result.rowCount} row(s) affected.`
                  : ' No rows returned.'}
              </p>
            </div>
          </div>
        )}

        {!result && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Database
                size={32}
                className="mx-auto text-gray-400 dark:text-slate-500"
              />
              <p className="text-gray-500 dark:text-slate-400">
                Write a SQL query and press Run to see results
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to render cell values
function CellValue({ value }: { value: unknown }) {
  if (value === null) {
    return (
      <span className="text-gray-500 dark:text-slate-500 italic">NULL</span>
    );
  }

  if (value === undefined) {
    return (
      <span className="text-gray-500 dark:text-slate-500 italic">
        undefined
      </span>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <span
        className={
          value
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }
      >
        {String(value)}
      </span>
    );
  }

  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value);
      return (
        <span className="text-blue-600 dark:text-blue-400" title={json}>
          {json.length > 50 ? json.slice(0, 50) + '...' : json}
        </span>
      );
    } catch {
      return (
        <span className="text-gray-500 dark:text-slate-500">[Object]</span>
      );
    }
  }

  const strValue = String(value);
  if (strValue.length > 100) {
    return <span title={strValue}>{strValue.slice(0, 100)}...</span>;
  }

  return <>{strValue}</>;
}
