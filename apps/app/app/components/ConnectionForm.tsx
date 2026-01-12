'use client';

import { useState, useEffect } from 'react';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import { Checkbox } from '@cloak-db/ui/components/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { useToast } from '@cloak-db/ui/components/toast';
import { trpc } from '@/lib/trpc/client';

interface ConnectionFormProps {
  initialConnectionString?: string;
}

export function ConnectionForm({
  initialConnectionString = '',
}: ConnectionFormProps) {
  const [connectionString, setConnectionString] = useState(
    initialConnectionString,
  );
  const [saveConnection, setSaveConnection] = useState(false);
  const [connectionName, setConnectionName] = useState('');
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  // Update connection string when prop changes (from saved connections)
  useEffect(() => {
    if (initialConnectionString) {
      setConnectionString(initialConnectionString);
    }
  }, [initialConnectionString]);

  const testMutation = trpc.connection.test.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success('Connection test successful!');
      } else {
        error(data.error?.message || 'Connection test failed');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

  const connectMutation = trpc.connection.connect.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        success(`Connected to ${data.database}@${data.host}`);
        utils.connection.status.invalidate();
      } else {
        error(data.error?.message || 'Connection failed');
      }
    },
    onError: (err) => {
      error(err.message || 'An error occurred');
    },
  });

  const saveConnectionMutation = trpc.config.saveConnection.useMutation({
    onSuccess: () => {
      utils.config.get.invalidate();
    },
  });

  const handleTest = () => {
    if (!connectionString.trim()) {
      error('Please enter a connection string');
      return;
    }
    testMutation.mutate({ connectionString });
  };

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      error('Please enter a connection string');
      return;
    }

    // Save connection first if checkbox is checked
    if (saveConnection && connectionName.trim()) {
      try {
        await saveConnectionMutation.mutateAsync({
          name: connectionName.trim(),
          connectionString,
        });
      } catch {
        // Continue with connect even if save fails
      }
    }

    connectMutation.mutate({ connectionString });
  };

  const isLoading =
    testMutation.isPending ||
    connectMutation.isPending ||
    saveConnectionMutation.isPending;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Connect to Database</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="connectionString"
            className="text-sm font-medium text-slate-700 dark:text-gray-300"
          >
            Connection String
          </label>
          <Input
            id="connectionString"
            type="text"
            placeholder="postgres://user:password@localhost:5432/database"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 dark:text-gray-500">
            Only PostgreSQL databases are supported
          </p>
        </div>

        {/* Save connection option */}
        <div className="space-y-3 text-left">
          <Checkbox
            checked={saveConnection}
            onChange={(e) => setSaveConnection(e.target.checked)}
            disabled={isLoading}
            label="Save this connection"
          />

          <div
            className={`space-y-2 overflow-hidden transition-all duration-200 ease-out ${
              saveConnection ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <label
              htmlFor="connectionName"
              className="text-sm font-medium text-slate-700 dark:text-gray-300"
            >
              Connection Name
            </label>
            <Input
              id="connectionName"
              type="text"
              placeholder="e.g., Local Dev, Staging"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              disabled={isLoading || !saveConnection}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isLoading || !connectionString.trim()}
          >
            {testMutation.isPending ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            variant="yellow"
            onClick={handleConnect}
            disabled={
              isLoading ||
              !connectionString.trim() ||
              (saveConnection && !connectionName.trim())
            }
          >
            {connectMutation.isPending ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
