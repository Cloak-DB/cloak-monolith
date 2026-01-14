'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@cloak-db/ui/components/button';
import { Input } from '@cloak-db/ui/components/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { useToast } from '@cloak-db/ui/components/toast';
import { Modal, ModalHeader, ModalTitle } from '@cloak-db/ui/components/modal';
import { trpc } from '@/lib/trpc/client';
import { useTheme } from '@/lib/theme/provider';
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Database,
  Trash2,
  Star,
  Pencil,
  Plus,
  ExternalLink,
} from 'lucide-react';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();
  const utils = trpc.useUtils();

  const config = trpc.config.get.useQuery();
  const connections = config.data?.connections ?? [];
  const { data: connectionStatus } = trpc.connection.status.useQuery();

  // Connect mutation for "Open Studio" button
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

  const handleOpenStudio = (connectionString: string) => {
    if (isConnected(connectionString)) {
      router.push('/studio');
    } else {
      connectMutation.mutate({ connectionString });
    }
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<{
    id: string;
    name: string;
    connectionString: string;
  } | null>(null);

  // Form states
  const [newConnectionName, setNewConnectionName] = useState('');
  const [newConnectionString, setNewConnectionString] = useState('');

  const saveConnectionMutation = trpc.config.saveConnection.useMutation({
    onSuccess: () => {
      success('Connection saved');
      utils.config.get.invalidate();
      setIsAddModalOpen(false);
      setEditingConnection(null);
      setNewConnectionName('');
      setNewConnectionString('');
    },
    onError: (err) => {
      error(err.message || 'Failed to save connection');
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

  const handleAddConnection = () => {
    if (!newConnectionName.trim() || !newConnectionString.trim()) {
      error('Please fill in all fields');
      return;
    }
    saveConnectionMutation.mutate({
      name: newConnectionName.trim(),
      connectionString: newConnectionString.trim(),
    });
  };

  const handleUpdateConnection = () => {
    if (!editingConnection) return;
    saveConnectionMutation.mutate({
      id: editingConnection.id,
      name: editingConnection.name,
      connectionString: editingConnection.connectionString,
    });
  };

  // Get display info from connection string
  const getDisplayInfo = (connectionString: string) => {
    try {
      const url = new URL(connectionString);
      return {
        host: `${url.hostname}:${url.port || '5432'}`,
        database: url.pathname.slice(1),
      };
    } catch {
      return { host: connectionString, database: '' };
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Theme
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select your preferred color theme
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'yellow' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="gap-2"
                >
                  <Sun size={16} />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'yellow' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="gap-2"
                >
                  <Moon size={16} />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connections Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connections</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2"
              >
                <Plus size={16} />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {connections.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Database size={32} className="mx-auto mb-2 opacity-50" />
                <p>No saved connections</p>
                <p className="text-sm">
                  Add a connection to quickly connect to your databases
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((conn) => {
                  const { host, database } = getDisplayInfo(
                    conn.connectionString,
                  );
                  return (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Database
                          size={20}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {conn.name}
                            </span>
                            {conn.default && (
                              <Star
                                size={14}
                                className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {host} / {database}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          onClick={() =>
                            handleOpenStudio(conn.connectionString)
                          }
                          disabled={connectMutation.isPending}
                          title={
                            isConnected(conn.connectionString)
                              ? 'Open Studio'
                              : 'Connect & Open Studio'
                          }
                        >
                          <ExternalLink size={14} />
                          <span className="text-xs">
                            {connectMutation.isPending
                              ? 'Connecting...'
                              : 'Open'}
                          </span>
                        </Button>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            setEditingConnection({
                              id: conn.id,
                              name: conn.name,
                              connectionString: conn.connectionString,
                            })
                          }
                          title="Edit connection"
                        >
                          <Pencil size={14} className="text-gray-400" />
                        </Button>
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
                            <Star size={14} className="text-gray-400" />
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Connection Modal */}
      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Add Connection</ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Connection Name
            </label>
            <Input
              placeholder="e.g., Production, Staging"
              value={newConnectionName}
              onChange={(e) => setNewConnectionName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Connection String
            </label>
            <Input
              placeholder="postgres://user:password@host:5432/database"
              value={newConnectionString}
              onChange={(e) => setNewConnectionString(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="yellow"
              onClick={handleAddConnection}
              disabled={saveConnectionMutation.isPending}
            >
              {saveConnectionMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Connection Modal */}
      <Modal
        open={!!editingConnection}
        onClose={() => setEditingConnection(null)}
      >
        <ModalHeader>
          <ModalTitle>Edit Connection</ModalTitle>
        </ModalHeader>
        {editingConnection && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection Name
              </label>
              <Input
                placeholder="e.g., Production, Staging"
                value={editingConnection.name}
                onChange={(e) =>
                  setEditingConnection({
                    ...editingConnection,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection String
              </label>
              <Input
                placeholder="postgres://user:password@host:5432/database"
                value={editingConnection.connectionString}
                onChange={(e) =>
                  setEditingConnection({
                    ...editingConnection,
                    connectionString: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingConnection(null)}
              >
                Cancel
              </Button>
              <Button
                variant="yellow"
                onClick={handleUpdateConnection}
                disabled={saveConnectionMutation.isPending}
              >
                {saveConnectionMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
