'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Table2 } from 'lucide-react';
import { useTabs } from '@/lib/tabs-context';
import { trpc } from '@/lib/trpc/client';
import { fuzzySearchItems } from '@/lib/fuzzy-search';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TableItem {
  schema: string;
  table: string;
  rowCount: number | null;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { openTab } = useTabs();

  // Fetch all schemas
  const { data: schemasData } = trpc.schema.getSchemas.useQuery(undefined, {
    enabled: isOpen,
  });

  // Fetch tables for each schema
  const schemas = schemasData?.schemas ?? [];
  const tableQueries = trpc.useQueries((t) =>
    schemas.map((s) => t.schema.getTables({ schema: s.name })),
  );

  // Combine all tables from all schemas
  const allTables = useMemo<TableItem[]>(() => {
    const tables: TableItem[] = [];
    tableQueries.forEach((query, index) => {
      if (query.data?.tables) {
        query.data.tables.forEach((t) => {
          tables.push({
            schema: schemas[index].name,
            table: t.name,
            rowCount: t.rowCount,
          });
        });
      }
    });
    return tables;
  }, [tableQueries, schemas]);

  // Fuzzy filter tables using Damerau-Levenshtein distance
  const filteredTables = useMemo(() => {
    return fuzzySearchItems(allTables, query, (t) => [
      t.table,
      `${t.schema}.${t.table}`,
    ]);
  }, [allTables, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTables.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const selectTable = useCallback(
    (table: TableItem) => {
      openTab({
        type: 'data',
        schema: table.schema,
        table: table.table,
      });
      onClose();
    },
    [openTab, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredTables.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTables[selectedIndex]) {
            selectTable(filteredTables[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredTables, selectedIndex, selectTable, onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tables..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
          />
          <kbd className="px-2 py-0.5 text-xs text-slate-500 bg-slate-700 rounded">
            esc
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto">
          {filteredTables.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              {allTables.length === 0 ? 'Loading tables...' : 'No tables found'}
            </div>
          ) : (
            filteredTables.map((table, index) => (
              <button
                key={`${table.schema}.${table.table}`}
                onClick={() => selectTable(table)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${
                    index === selectedIndex
                      ? 'bg-yellow-500/20 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }
                `}
              >
                <Table2 size={16} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500">{table.schema}.</span>
                  <span className="font-medium">{table.table}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {table.rowCount !== null
                    ? `${table.rowCount.toLocaleString()} rows`
                    : '— rows'}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 text-xs text-slate-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded mr-1">↑↓</kbd>
            navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded mr-1">↵</kbd>
            open
          </span>
        </div>
      </div>
    </div>
  );
}
