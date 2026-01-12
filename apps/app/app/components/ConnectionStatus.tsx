'use client';

import { Button } from '@cloak-db/ui/components/button';
import { useToast } from '@cloak-db/ui/components/toast';
import { trpc } from '@/lib/trpc/client';

export function ConnectionStatus() {
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  const status = trpc.connection.status.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const disconnectMutation = trpc.connection.disconnect.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success('Disconnected from database');
        utils.connection.status.invalidate();
      } else {
        error('Failed to disconnect');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const isConnected = status.data?.connected;
  const isLoading = status.isLoading;

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm border border-slate-200 dark:border-gray-700">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isLoading
            ? 'bg-yellow-500 animate-pulse'
            : isConnected
              ? 'bg-green-500'
              : 'bg-gray-400'
        }`}
      />
      <span className="text-slate-600 dark:text-gray-400">
        {isLoading
          ? 'Checking...'
          : isConnected
            ? `${status.data?.database}@${status.data?.host}`
            : 'Not connected'}
      </span>
      {isConnected && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={disconnectMutation.isPending}
          className="h-7 px-2 text-xs"
        >
          {disconnectMutation.isPending ? '...' : 'Disconnect'}
        </Button>
      )}
    </div>
  );
}
