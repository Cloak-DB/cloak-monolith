'use client';

import { Select } from '@cloak-db/ui/components/select';
import { Spinner } from '@cloak-db/ui/components/spinner';
import { trpc } from '@/lib/trpc/client';
import { useSchema } from '@/lib/schema-context';
import { useDevOverrides } from '@/lib/dev/use-dev-overrides';
import { Inbox } from 'lucide-react';

export function SchemaSelector() {
  const { selectedSchema, setSelectedSchema } = useSchema();
  const { data, isLoading, error } = trpc.schema.getSchemas.useQuery();

  // Dev overrides for testing loading states
  const { isForceLoading } = useDevOverrides();
  const effectiveIsLoading = isLoading || isForceLoading;

  if (effectiveIsLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Spinner size="sm" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loading schemas...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 text-sm text-red-500">
        Failed to load schemas
      </div>
    );
  }

  const schemas = data?.schemas ?? [];

  if (schemas.length === 0) {
    return (
      <div className="px-3 py-4 flex flex-col items-center gap-1 text-center">
        <Inbox size={20} className="text-gray-400 dark:text-gray-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          No schemas found
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
        Schema
      </label>
      <Select
        value={selectedSchema}
        onChange={(e) => setSelectedSchema(e.target.value)}
        className="h-10 text-sm"
      >
        {schemas.map((schema) => (
          <option key={schema.name} value={schema.name}>
            {schema.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
