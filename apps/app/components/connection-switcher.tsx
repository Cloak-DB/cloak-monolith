'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Database, ChevronDown, Check, Plus, Settings } from 'lucide-react';

interface ConnectionSwitcherProps {
  currentDatabase: string;
  currentHost: string;
  currentPort: number;
}

export function ConnectionSwitcher({
  currentDatabase,
  currentHost,
  currentPort,
}: ConnectionSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: configData } = trpc.config.get.useQuery();
  const connectMutation = trpc.connection.connect.useMutation({
    onSuccess: () => {
      utils.connection.status.invalidate();
      setIsOpen(false);
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const savedConnections = configData?.connections ?? [];

  const handleConnect = (connectionString: string) => {
    connectMutation.mutate({ connectionString });
  };

  // Find current connection name from saved connections
  const currentConnectionName = savedConnections.find((conn) =>
    conn.connectionString.includes(currentDatabase),
  )?.name;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-900"
      >
        <Database className="h-4 w-4 text-yellow-500" />
        <span className="font-medium text-sm text-gray-900 dark:text-white max-w-[150px] truncate">
          {currentConnectionName || currentDatabase}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-lg shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.3)] z-50">
          {/* Saved connections */}
          <div className="p-2 max-h-64 overflow-y-auto">
            {savedConnections.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No saved connections
              </div>
            ) : (
              savedConnections.map((conn) => {
                const isCurrentConnection =
                  conn.connectionString.includes(currentDatabase);
                return (
                  <button
                    key={conn.name}
                    onClick={() =>
                      !isCurrentConnection &&
                      handleConnect(conn.connectionString)
                    }
                    disabled={connectMutation.isPending}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                      ${
                        isCurrentConnection
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${connectMutation.isPending ? 'opacity-50 cursor-wait' : ''}
                    `}
                  >
                    {isCurrentConnection ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {conn.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {
                          conn.connectionString
                            .replace(/postgresql:\/\/[^:]+:[^@]+@/, '')
                            .split('/')[0]
                        }
                      </div>
                    </div>
                    {isCurrentConnection && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Connected
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Add new connection
              </span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Manage connections
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
