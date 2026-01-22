'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@cloak-db/ui/components/input';
import { Skeleton } from '@cloak-db/ui/components/skeleton';
import { trpc } from '@/lib/trpc/client';
import { useSchema } from '@/lib/schema-context';
import { useTabs } from '@/lib/tabs-context';
import { SchemaSelector } from './schema-selector';
import { SidebarContextMenu } from './sidebar-context-menu';
import { Table, Zap, Search, Inbox, SearchX } from 'lucide-react';
import { useDevOverrides } from '@/lib/dev/use-dev-overrides';

function formatRowCount(count: number | null): string {
  if (count === null) return '—';
  return count.toLocaleString();
}

interface TableListItemProps {
  name: string;
  rowCount: number | null;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function TableListItem({
  name,
  rowCount,
  isSelected,
  onClick,
  onContextMenu,
}: TableListItemProps) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-lg
        transition-colors duration-150 text-left
        ${
          isSelected
            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Table
          size={16}
          className={`flex-shrink-0 ${isSelected ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}
        />
        <span
          className={`text-sm truncate ${isSelected ? 'font-semibold text-yellow-900 dark:text-yellow-100' : 'text-gray-700 dark:text-gray-300'}`}
        >
          {name}
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-500 ml-2 flex-shrink-0">
        ({formatRowCount(rowCount)})
      </span>
    </button>
  );
}

// Skeleton version of TableListItem for loading state
function SkeletonTableItem({ index }: { index: number }) {
  // Vary the width based on index for visual interest
  const nameWidth = 60 + ((index * 17) % 40); // 60-100%
  return (
    <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Skeleton className="w-4 h-4 flex-shrink-0" variant="rectangular" />
        <Skeleton
          className="h-4 flex-1"
          style={{ maxWidth: `${nameWidth}%` }}
        />
      </div>
      <Skeleton className="h-3 w-8 ml-2 flex-shrink-0" />
    </div>
  );
}

export function SchemaSidebar() {
  const { selectedSchema } = useSchema();
  const { activeTabId, openTab, getTabById } = useTabs();
  const [filter, setFilter] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    tableName: string;
    position: { x: number; y: number };
  } | null>(null);

  const { data, isLoading, error } = trpc.schema.getTables.useQuery(
    { schema: selectedSchema },
    { enabled: !!selectedSchema },
  );

  // Dev overrides for testing loading states
  const { isForceLoading } = useDevOverrides();
  const effectiveIsLoading = isLoading || isForceLoading;

  // Get current table from active tab
  const currentTable = useMemo(() => {
    if (!activeTabId) return null;
    const tab = getTabById(activeTabId);
    if (!tab || tab.schema !== selectedSchema) return null;
    return tab.table;
  }, [activeTabId, getTabById, selectedSchema]);

  const handleTableClick = useCallback(
    (tableName: string) => {
      openTab({ type: 'data', schema: selectedSchema, table: tableName });
    },
    [openTab, selectedSchema],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, tableName: string) => {
      e.preventDefault();
      setContextMenu({
        tableName,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Filter tables based on search
  const filteredTables = useMemo(() => {
    if (!data?.tables) return [];
    if (!filter.trim()) return data.tables;
    const lowerFilter = filter.toLowerCase();
    return data.tables.filter((table) =>
      table.name.toLowerCase().includes(lowerFilter),
    );
  }, [data?.tables, filter]);

  return (
    <aside className="w-64 h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* Schema Selector */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <SchemaSelector />
      </div>

      {/* Search/Filter */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Filter tables..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tables
          </h3>

          {effectiveIsLoading && (
            <div className="space-y-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTableItem key={i} index={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="px-3 py-4 text-sm text-red-500">
              Failed to load tables
            </div>
          )}

          {!effectiveIsLoading && !error && filteredTables.length === 0 && (
            <div className="px-3 py-8 flex flex-col items-center gap-2 text-center">
              {filter ? (
                <>
                  <SearchX
                    size={24}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tables match &quot;{filter}&quot;
                  </p>
                </>
              ) : (
                <>
                  <Inbox
                    size={24}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tables in this schema
                  </p>
                </>
              )}
            </div>
          )}

          {!effectiveIsLoading && !error && filteredTables.length > 0 && (
            <div className="space-y-0.5">
              {filteredTables.map((table) => (
                <TableListItem
                  key={table.name}
                  name={table.name}
                  rowCount={table.rowCount}
                  isSelected={currentTable === table.name}
                  onClick={() => handleTableClick(table.name)}
                  onContextMenu={(e) => handleContextMenu(e, table.name)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query Runner Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => openTab({ type: 'query', title: 'Query' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-150"
        >
          <Zap size={16} className="text-yellow-500" />
          Query Runner
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <SidebarContextMenu
          isOpen={true}
          position={contextMenu.position}
          tableName={contextMenu.tableName}
          onClose={closeContextMenu}
          onOpenData={() => {
            openTab({
              type: 'data',
              schema: selectedSchema,
              table: contextMenu.tableName,
            });
          }}
          onOpenStructure={() => {
            openTab({
              type: 'structure',
              schema: selectedSchema,
              table: contextMenu.tableName,
            });
          }}
          onOpenInNewTab={() => {
            // Generate unique ID to force new tab
            openTab({
              type: 'data',
              schema: selectedSchema,
              table: contextMenu.tableName,
            });
          }}
        />
      )}
    </aside>
  );
}
