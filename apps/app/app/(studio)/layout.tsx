'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cloak-db/ui/components/button';
import { trpc } from '@/lib/trpc/client';
import { SchemaProvider } from '@/lib/schema-context';
import { TabsProvider, useTabs } from '@/lib/tabs-context';
import { SchemaSidebar } from '@/components/schema-sidebar';
import { TabBar } from '@/components/tab-bar';
import { TabContent } from '@/components/tab-content';
import { CloseTabDialog } from '@/components/close-tab-dialog';
import { CommandPalette } from '@/components/command-palette';
import { Spinner } from '@cloak-db/ui/components/spinner';
import { Database, LogOut, Home } from 'lucide-react';
import Link from 'next/link';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: status, isLoading } = trpc.connection.status.useQuery();
  const utils = trpc.useUtils();

  const disconnectMutation = trpc.connection.disconnect.useMutation({
    onSuccess: () => {
      utils.connection.status.invalidate();
      router.push('/');
    },
  });

  // Show loading state while checking connection
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking connection...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to home if not connected
  if (!status?.connected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <Database size={48} className="mx-auto text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect to a database first.
          </p>
          <Link href="/">
            <Button variant="yellow">
              <Home size={16} className="mr-2" />
              Go to Connection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build connection key for tab persistence: host:port/database
  const connectionKey =
    status.host && status.database
      ? `${status.host}:${status.port ?? 5432}/${status.database}`
      : null;

  return (
    <SchemaProvider defaultSchema="public">
      <TabsProvider connectionKey={connectionKey}>
        <StudioContent
          database={status.database ?? ''}
          host={status.host ?? ''}
          port={status.port ?? 5432}
          onDisconnect={() => disconnectMutation.mutate()}
          isDisconnecting={disconnectMutation.isPending}
        />
      </TabsProvider>
    </SchemaProvider>
  );
}

// Inner component that can use useTabs hook
interface StudioContentProps {
  database: string;
  host: string;
  port: number;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

function StudioContent({
  database,
  host,
  port,
  onDisconnect,
  isDisconnecting,
}: StudioContentProps) {
  const { tabs, activeTabId, closeTab, openTab } = useTabs();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const isTyping =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      // W - Close active tab (only when not typing)
      if (e.key === 'w' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }

      // Cmd+E / Ctrl+E - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // Cmd+J / Ctrl+J - Open new query tab
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        openTab({ type: 'query', title: 'Query' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab, openTab]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <SchemaSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-yellow-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {database}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              @{host}:{port}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" className="h-8 px-3 text-sm">
                <Home size={14} className="mr-1.5" />
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-8 px-3 text-sm"
              onClick={onDisconnect}
              disabled={isDisconnecting}
            >
              <LogOut size={14} className="mr-1.5" />
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        </header>

        {/* Tab Bar */}
        <TabBar />

        {/* Tab Content */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
          <TabContent />
        </main>
      </div>

      {/* Command Palette (Cmd+E) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Close Tab Confirmation Dialog */}
      <CloseTabDialog />
    </div>
  );
}
