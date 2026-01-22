'use client';

import { Database, Table, ArrowRight } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useSchema } from '@/lib/schema-context';

export default function StudioPage() {
  const { selectedSchema } = useSchema();
  const { data } = trpc.schema.getTables.useQuery(
    { schema: selectedSchema },
    { enabled: !!selectedSchema },
  );

  const tableCount = data?.tables.length ?? 0;
  const totalRows =
    data?.tables.reduce((sum, t) => sum + (t.rowCount ?? 0), 0) ?? 0;
  const hasUnknownCounts =
    data?.tables.some((t) => t.rowCount === null) ?? false;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <Database size={32} className="text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to the Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a table from the sidebar to view its structure.
          </p>
        </div>

        {tableCount > 0 && (
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Table size={16} />
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {tableCount}
                </strong>{' '}
                tables
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ArrowRight size={16} />
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {hasUnknownCounts ? '~' : ''}
                  {totalRows.toLocaleString()}
                </strong>{' '}
                total rows
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
