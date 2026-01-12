'use client';

import { useState } from 'react';
import { Badge } from '@cloak-db/ui/components/badge';
import { ConnectionForm } from './components/ConnectionForm';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SavedConnections } from './components/SavedConnections';
import { HealthCheck } from './components/HealthCheck';

export default function HomePage() {
  const [selectedConnectionString, setSelectedConnectionString] = useState('');

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black">
      {/* Ambient gradient orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-purple-500 to-blue-500 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-yellow-500 to-orange-500 pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-6 relative z-10">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <Badge variant="yellow" className="uppercase tracking-wider">
            Early Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Cloak DB
            </span>
          </h1>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center">
          <ConnectionStatus />
        </div>

        {/* Connection Form */}
        <div className="flex justify-center">
          <ConnectionForm initialConnectionString={selectedConnectionString} />
        </div>

        {/* Saved Connections */}
        <div className="flex justify-center">
          <SavedConnections onSelect={setSelectedConnectionString} />
        </div>

        {/* Health Check Component */}
        <div className="pt-4 flex justify-center gap-4">
          <HealthCheck />
        </div>
      </div>
    </main>
  );
}
