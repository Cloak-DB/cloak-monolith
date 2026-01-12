'use client';

import { Button } from '@cloak-db/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { useToast } from '@cloak-db/ui/components/toast';
import { trpc } from '@/lib/trpc/client';

interface SavedConnectionsProps {
  onSelect: (connectionString: string) => void;
}

export function SavedConnections({ onSelect }: SavedConnectionsProps) {
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  const config = trpc.config.get.useQuery();
  const deleteMutation = trpc.config.deleteConnection.useMutation({
    onSuccess: () => {
      success('Connection deleted');
      utils.config.get.invalidate();
    },
    onError: (err) => {
      error(err.message || 'Failed to delete connection');
    },
  });

  const setDefaultMutation = trpc.config.setDefaultConnection.useMutation({
    onSuccess: () => {
      success('Default connection updated');
      utils.config.get.invalidate();
    },
    onError: (err) => {
      error(err.message || 'Failed to set default');
    },
  });

  const connections = config.data?.connections ?? [];
  const hasConnections = !config.isLoading && connections.length > 0;

  return (
    <div
      className={`w-full max-w-xl overflow-hidden transition-all duration-200 ease-out ${
        hasConnections ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Saved Connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {connections.map((conn) => {
            // Parse connection string to show host/db without credentials
            let displayInfo = conn.connectionString;
            try {
              const url = new URL(conn.connectionString);
              displayInfo = `${url.hostname}:${url.port || '5432'}${url.pathname}`;
            } catch {
              // Keep original if parsing fails
            }

            return (
              <div
                key={conn.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => onSelect(conn.connectionString)}
                >
                  <div className="flex items-center gap-2">
                    {conn.default && (
                      <span
                        className="text-yellow-500"
                        title="Default connection"
                      >
                        ⭐
                      </span>
                    )}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {conn.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mt-0.5">
                    {displayInfo}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  {!conn.default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setDefaultMutation.mutate({ id: conn.id })}
                      disabled={setDefaultMutation.isPending}
                      title="Set as default"
                    >
                      ⭐
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950"
                    onClick={() => deleteMutation.mutate({ id: conn.id })}
                    disabled={deleteMutation.isPending}
                    title="Delete connection"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
