'use client';

import { trpc } from '@/lib/trpc/client';

export function HealthCheck() {
  const health = trpc.health.useQuery();

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm border border-slate-200 dark:border-gray-700">
      <span
        className={`w-2 h-2 rounded-full ${
          health.isLoading
            ? 'bg-yellow-500 animate-pulse'
            : health.data?.status === 'ok'
              ? 'bg-green-500'
              : 'bg-red-500'
        }`}
      />
      <span className="text-slate-600 dark:text-gray-400">
        {health.isLoading
          ? 'Checking API...'
          : health.data?.status === 'ok'
            ? 'API Connected'
            : 'API Error'}
      </span>
    </div>
  );
}
