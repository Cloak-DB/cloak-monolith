'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useTabs, type Tab } from '@/lib/tabs-context';
import { trpc } from '@/lib/trpc/client';
import { Spinner } from '@cloak-db/ui/components/spinner';
import { Badge } from '@cloak-db/ui/components/badge';
import {
  Key,
  Link as LinkIcon,
  Database,
  Table,
  FolderOpen,
} from 'lucide-react';
import { DataBrowser } from '@/components/data-browser';
import { QueryRunner } from '@/components/query-runner';

// ============================================================================
// Tab Content Container
// ============================================================================

export function TabContent() {
  const { tabs, activeTabId } = useTabs();

  if (tabs.length === 0 || !activeTabId) {
    return <EmptyState />;
  }

  return (
    <div className="h-full overflow-hidden relative">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`absolute inset-0 ${
            tab.id === activeTabId ? 'z-10' : 'z-0 invisible'
          }`}
        >
          <TabPanel tab={tab} isActive={tab.id === activeTabId} />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Empty State (no tabs open)
// ============================================================================

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4 max-w-md">
        <FolderOpen size={48} className="mx-auto text-slate-500" />
        <h2 className="text-xl font-semibold text-white">No tables open</h2>
        <p className="text-slate-400">
          Select a table from the sidebar or press{' '}
          <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Cmd+E</kbd>{' '}
          to search and open a table.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Tab Panel
// ============================================================================

interface TabPanelProps {
  tab: Tab;
  isActive: boolean;
}

function TabPanel({ tab, isActive }: TabPanelProps) {
  if (tab.type === 'data') {
    return <DataTabPanel tab={tab} isActive={isActive} />;
  }

  if (tab.type === 'query') {
    return <QueryRunner />;
  }

  return <StructureTabPanel tab={tab} isActive={isActive} />;
}

// ============================================================================
// Data Tab Panel
// ============================================================================

interface DataTabPanelProps {
  tab: Tab;
  isActive: boolean;
}

function DataTabPanel({ tab }: DataTabPanelProps) {
  const { setTabHasChanges } = useTabs();

  // Data tabs always have schema and table
  const schema = tab.schema!;
  const table = tab.table!;

  // Memoize callback to prevent infinite re-renders
  const handleHasChanges = useCallback(
    (hasChanges: boolean) => setTabHasChanges(tab.id, hasChanges),
    [tab.id, setTabHasChanges],
  );

  const {
    data: columnsData,
    isLoading,
    error,
  } = trpc.schema.getColumns.useQuery({
    schema,
    table,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-slate-400">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Database size={48} className="mx-auto text-red-400" />
          <h2 className="text-xl font-semibold text-white">
            Error Loading Table
          </h2>
          <p className="text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const columns = columnsData?.columns ?? [];

  return (
    <div className="h-full overflow-hidden">
      <DataBrowser
        schema={schema}
        table={table}
        columns={columns}
        onHasChanges={handleHasChanges}
      />
    </div>
  );
}

// ============================================================================
// Structure Tab Panel
// ============================================================================

interface StructureTabPanelProps {
  tab: Tab;
  isActive: boolean;
}

function formatColumnType(column: {
  type: string;
  maxLength: number | null;
  precision: number | null;
}): string {
  if (column.maxLength) return `${column.type}(${column.maxLength})`;
  if (column.precision) return `${column.type}(${column.precision})`;
  return column.type;
}

function StructureTabPanel({ tab }: StructureTabPanelProps) {
  // Structure tabs always have schema and table
  const schema = tab.schema!;
  const table = tab.table!;

  const {
    data: columnsData,
    isLoading: columnsLoading,
    error: columnsError,
  } = trpc.schema.getColumns.useQuery({
    schema,
    table,
  });

  const {
    data: indexesData,
    isLoading: indexesLoading,
    error: indexesError,
  } = trpc.schema.getIndexes.useQuery({
    schema,
    table,
  });

  const { data: tablesData, isLoading: tablesLoading } =
    trpc.schema.getTables.useQuery({ schema });

  const isLoading = columnsLoading || indexesLoading || tablesLoading;
  const hasError = columnsError || indexesError;

  // Get row count for this table
  const tableInfo = tablesData?.tables.find((t) => t.name === table);
  const rowCount = tableInfo?.rowCount ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-slate-400">Loading table structure...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Database size={48} className="mx-auto text-red-400" />
          <h2 className="text-xl font-semibold text-white">
            Error Loading Structure
          </h2>
          <p className="text-slate-400">
            {columnsError?.message || indexesError?.message}
          </p>
        </div>
      </div>
    );
  }

  const columns = columnsData?.columns ?? [];
  const indexes = indexesData?.indexes ?? [];

  // Extract relationships from columns with foreign keys
  const relationships = columns
    .filter((col) => col.foreignKey !== null)
    .map((col) => ({
      column: col.name,
      foreignSchema: col.foreignKey!.schema,
      foreignTable: col.foreignKey!.table,
      foreignColumn: col.foreignKey!.column,
    }));

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Table size={28} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {table}
          </h1>
          <Badge variant="default" className="ml-2">
            {rowCount.toLocaleString()} rows
          </Badge>
        </div>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {schema}.{table}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Columns Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Columns
          </h2>
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Nullable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {columns.map((column) => (
                  <tr
                    key={column.name}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {column.isPrimaryKey && (
                          <span title="Primary Key">
                            <Key size={14} className="text-yellow-500" />
                          </span>
                        )}
                        {column.foreignKey && (
                          <span
                            title={`FK: ${column.foreignKey.table}.${column.foreignKey.column}`}
                          >
                            <LinkIcon size={14} className="text-blue-500" />
                          </span>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {column.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-700 dark:text-slate-300">
                        {formatColumnType(column)}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm ${column.nullable ? 'text-gray-500 dark:text-slate-500' : 'text-gray-900 dark:text-white font-medium'}`}
                      >
                        {column.nullable ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {column.default ? (
                        <code className="text-sm bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-400">
                          {column.default}
                        </code>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-600">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Relationships Section */}
        {relationships.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Relationships
            </h2>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {relationships.map((rel) => (
                  <div
                    key={rel.column}
                    className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <LinkIcon size={14} className="text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {rel.column}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">
                      -&gt;
                    </span>
                    <Link
                      href={`/tables/${rel.foreignSchema}/${rel.foreignTable}`}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline"
                    >
                      {rel.foreignSchema}.{rel.foreignTable}.{rel.foreignColumn}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Indexes Section */}
        {indexes.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Indexes
            </h2>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {indexes.map((index) => (
                  <div
                    key={index.name}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {index.name}
                      {index.name.includes('pkey') && (
                        <Badge variant="yellow" className="ml-2 text-xs">
                          PRIMARY
                        </Badge>
                      )}
                      {index.definition.includes('UNIQUE') &&
                        !index.name.includes('pkey') && (
                          <Badge variant="blue" className="ml-2 text-xs">
                            UNIQUE
                          </Badge>
                        )}
                    </div>
                    <code className="text-xs text-gray-500 dark:text-slate-500 mt-1 block">
                      {index.definition}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
