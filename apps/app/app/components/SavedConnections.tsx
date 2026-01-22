'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@cloak-db/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { useToast } from '@cloak-db/ui/components/toast';
import { trpc } from '@/lib/trpc/client';
import { Database, Trash2, Star } from 'lucide-react';

interface SavedConnectionsProps {
  onSelect: (connectionString: string) => void;
}

export function SavedConnections({ onSelect }: SavedConnectionsProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  const config = trpc.config.get.useQuery();
  const { data: connectionStatus } = trpc.connection.status.useQuery();

  const disconnectMutation = trpc.connection.disconnect.useMutation();

  const connectMutation = trpc.connection.connect.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success(`Connected to ${data.database}@${data.host}`);
        utils.connection.status.invalidate();
        router.push('/studio');
      } else {
        error(data.error?.message || 'Connection failed');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

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

  const handleConnect = async (connectionString: string) => {
    // Disconnect from current connection first if connected
    if (connectionStatus?.connected) {
      await disconnectMutation.mutateAsync();
      utils.connection.status.invalidate();
    }
    connectMutation.mutate({ connectionString });
  };

  // Check if a connection is currently active
  const isConnected = (connectionString: string): boolean => {
    if (!connectionStatus?.connected) return false;
    try {
      const url = new URL(connectionString);
      return (
        connectionStatus.database === url.pathname.slice(1) &&
        connectionStatus.host === url.hostname
      );
    } catch {
      return false;
    }
  };

  return (
    <div
      className={`w-full max-w-xl overflow-hidden transition-all duration-200 ease-out ${
        hasConnections ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Saved Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connections.map((conn) => {
              // Parse connection string to show host/db without credentials
              let host = '';
              let database = '';
              try {
                const url = new URL(conn.connectionString);
                host = `${url.hostname}:${url.port || '5432'}`;
                database = url.pathname.slice(1);
              } catch {
                host = conn.connectionString;
              }

              const connected = isConnected(conn.connectionString);

              return (
                <div
                  key={conn.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${
                      connected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                  `}
                >
                  {/* Connection indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    />
                    <span className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                      {conn.name}
                    </span>
                    {conn.default && (
                      <Star
                        size={14}
                        className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Connection details */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5 mb-3">
                    <div className="truncate">{host}</div>
                    <div className="font-mono text-xs truncate">{database}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => router.push('/studio')}
                      >
                        <Database size={14} className="mr-1.5" />
                        Open Studio
                      </Button>
                    ) : (
                      <Button
                        variant="yellow"
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => handleConnect(conn.connectionString)}
                        disabled={connectMutation.isPending}
                      >
                        {connectMutation.isPending
                          ? 'Connecting...'
                          : 'Connect'}
                      </Button>
                    )}

                    {/* Menu actions */}
                    <div className="flex items-center">
                      {!conn.default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setDefaultMutation.mutate({ id: conn.id })
                          }
                          disabled={setDefaultMutation.isPending}
                          title="Set as default"
                        >
                          <Star
                            size={14}
                            className="text-gray-400 hover:text-yellow-500"
                          />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => deleteMutation.mutate({ id: conn.id })}
                        disabled={deleteMutation.isPending}
                        title="Delete connection"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
