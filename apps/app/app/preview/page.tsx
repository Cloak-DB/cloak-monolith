'use client';

import { useState } from 'react';
import { Button } from '@cloak-db/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@cloak-db/ui/components/card';
import { Input } from '@cloak-db/ui/components/input';
import {
  Database,
  Table,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  Home,
  Settings,
  X,
  Check,
  Plus,
  Command,
} from 'lucide-react';

// Mock data for previews
const mockConnections = [
  {
    name: 'Production',
    host: 'prod.db.example.com',
    database: 'myapp_prod',
    isConnected: true,
  },
  {
    name: 'Staging',
    host: 'stage.db.example.com',
    database: 'myapp_stage',
    isConnected: false,
  },
  {
    name: 'Local Dev',
    host: 'localhost',
    database: 'myapp_dev',
    isConnected: false,
  },
];

const mockSchemas = [
  {
    name: 'public',
    tables: [
      { name: 'users', rowCount: 1234 },
      { name: 'orders', rowCount: 5678 },
      { name: 'products', rowCount: 892 },
      { name: 'categories', rowCount: 24 },
    ],
  },
  {
    name: 'auth',
    tables: [
      { name: 'sessions', rowCount: 456 },
      { name: 'tokens', rowCount: 123 },
      { name: 'permissions', rowCount: 15 },
    ],
  },
  {
    name: 'analytics',
    tables: [
      { name: 'events', rowCount: 45678 },
      { name: 'pageviews', rowCount: 12345 },
    ],
  },
];

// ============================================
// PREVIEW: Home Page with Connection Cards
// ============================================
function HomePagePreview() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <span className="font-bold text-lg">Cloak DB</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
            <Database size={32} className="text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold">Cloak DB</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your database, your way
          </p>
        </div>

        {/* Saved Connections */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Saved Connections</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockConnections.map((conn) => (
                <div
                  key={conn.name}
                  className={`
                    p-4 rounded-lg border-2
                    ${
                      conn.isConnected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                    transition-colors cursor-pointer
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${conn.isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <span className="font-semibold">{conn.name}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <div>{conn.host}</div>
                    <div className="font-mono text-xs">{conn.database}</div>
                  </div>
                  <Button
                    variant={conn.isConnected ? 'outline' : 'yellow'}
                    size="sm"
                    className="w-full mt-3"
                  >
                    {conn.isConnected ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Quick Connect */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="postgresql://user:pass@host:5432/database"
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="rounded" />
                Save this connection
              </label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Test
                </Button>
                <Button variant="yellow" size="sm">
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// PREVIEW: Connection Switcher Dropdown
// ============================================
function ConnectionSwitcherPreview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        <Database className="h-4 w-4 text-yellow-500" />
        <span className="font-medium">myapp_prod</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-lg shadow-offset z-50">
          <div className="p-2">
            {mockConnections.map((conn) => (
              <button
                key={conn.name}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                  ${
                    conn.isConnected
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {conn.isConnected ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-4" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{conn.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {conn.database}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800">
              <Plus className="h-4 w-4 text-gray-400" />
              <span>Add new connection</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="h-4 w-4 text-gray-400" />
              <span>Manage connections</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PREVIEW: Tree View Sidebar
// ============================================
function TreeViewSidebarPreview() {
  const [expandedSchemas, setExpandedSchemas] = useState<string[]>(['public']);
  const [selectedTable, setSelectedTable] = useState<string | null>('users');
  const [filter, setFilter] = useState('');

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) =>
      prev.includes(schemaName)
        ? prev.filter((s) => s !== schemaName)
        : [...prev, schemaName],
    );
  };

  const filteredSchemas = mockSchemas
    .map((schema) => ({
      ...schema,
      tables: filter
        ? schema.tables.filter((t) =>
            t.name.toLowerCase().includes(filter.toLowerCase()),
          )
        : schema.tables,
    }))
    .filter((schema) => !filter || schema.tables.length > 0);

  return (
    <div className="w-64 h-[500px] flex flex-col border-2 border-black dark:border-white rounded-lg bg-white dark:bg-gray-950">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Filter tables..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Schemas
        </h3>
        {filteredSchemas.map((schema) => (
          <div key={schema.name} className="mb-1">
            {/* Schema header */}
            <button
              onClick={() => toggleSchema(schema.name)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
            >
              {expandedSchemas.includes(schema.name) ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <Database className="h-4 w-4 text-yellow-500" />
              <span className="font-medium flex-1">{schema.name}</span>
              <span className="text-xs text-gray-500">
                ({schema.tables.length})
              </span>
            </button>

            {/* Tables */}
            {expandedSchemas.includes(schema.name) && (
              <div className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700">
                {schema.tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm
                      ${
                        selectedTable === table.name
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-2 border-yellow-500 -ml-[2px]'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Table
                      className={`h-3.5 w-3.5 ${selectedTable === table.name ? 'text-yellow-600' : 'text-gray-400'}`}
                    />
                    <span
                      className={`flex-1 ${selectedTable === table.name ? 'font-medium' : ''}`}
                    >
                      {table.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {table.rowCount.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Query link */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
          <Zap className="h-4 w-4 text-yellow-500" />
          Query Runner
        </button>
      </div>
    </div>
  );
}

// ============================================
// PREVIEW: Full Studio Layout
// ============================================
function StudioLayoutPreview() {
  const [openTabs] = useState([
    { name: 'users', type: 'data' },
    { name: 'orders', type: 'structure' },
  ]);
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="border-2 border-black dark:border-white rounded-lg overflow-hidden bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span className="font-bold">Cloak DB</span>
          </div>
          <ConnectionSwitcherPreview />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800">
            <Command className="h-3 w-3" />
            <span>E</span>
          </button>
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex h-[400px]">
        {/* Sidebar - simplified for inline */}
        <div className="w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto p-2">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            Schemas
          </h3>
          {mockSchemas.slice(0, 2).map((schema) => (
            <div key={schema.name} className="mb-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronDown className="h-4 w-4 text-gray-400" />
                <Database className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{schema.name}</span>
              </div>
              <div className="ml-6 pl-2 border-l border-gray-200 dark:border-gray-700">
                {schema.tables.slice(0, 3).map((table) => (
                  <div
                    key={table.name}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer
                      ${activeTab === table.name ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                    onClick={() => setActiveTab(table.name)}
                  >
                    <Table className="h-3.5 w-3.5 text-gray-400" />
                    <span>{table.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
            {openTabs.map((tab) => (
              <div
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-t text-sm cursor-pointer
                  ${
                    activeTab === tab.name
                      ? 'bg-white dark:bg-gray-950 border-t-2 border-yellow-500'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Table className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
                <span className="text-xs text-gray-500">({tab.type})</span>
                <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </div>
            ))}
          </div>

          {/* Table content placeholder */}
          <div className="flex-1 p-4">
            <div className="text-sm text-gray-500 mb-4">
              TABLE:{' '}
              <span className="font-mono font-semibold text-black dark:text-white">
                {activeTab}
              </span>
            </div>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">id</th>
                    <th className="px-4 py-2 text-left font-medium">name</th>
                    <th className="px-4 py-2 text-left font-medium">email</th>
                    <th className="px-4 py-2 text-left font-medium">
                      created_at
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 font-mono">1</td>
                    <td className="px-4 py-2">Alice</td>
                    <td className="px-4 py-2">alice@example.com</td>
                    <td className="px-4 py-2 font-mono text-xs">2024-01-15</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 font-mono">2</td>
                    <td className="px-4 py-2">Bob</td>
                    <td className="px-4 py-2">bob@example.com</td>
                    <td className="px-4 py-2 font-mono text-xs">2024-01-16</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PREVIEW PAGE
// ============================================
export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Navigation Preview</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review the proposed navigation improvements before implementation
          </p>
        </div>

        {/* Preview 1: Home Page */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold text-sm">
              1
            </span>
            <h2 className="text-xl font-bold">
              Home Page (Connection Manager)
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            Saved connections as cards with quick connect option below. Click a
            card to connect and auto-redirect to studio.
          </p>
          <div className="ml-11">
            <HomePagePreview />
          </div>
        </section>

        {/* Preview 2: Tree View Sidebar */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold text-sm">
              2
            </span>
            <h2 className="text-xl font-bold">Tree View Sidebar</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            Collapsible schema hierarchy. Click schema to expand/collapse. Click
            table to open in tab. Filter searches across all schemas.
          </p>
          <div className="ml-11">
            <TreeViewSidebarPreview />
          </div>
        </section>

        {/* Preview 3: Connection Switcher */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold text-sm">
              3
            </span>
            <h2 className="text-xl font-bold">Connection Switcher</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            Dropdown in studio header for quick database switching without
            leaving the studio.
          </p>
          <div className="ml-11 p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <ConnectionSwitcherPreview />
          </div>
        </section>

        {/* Preview 4: Full Studio Layout */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold text-sm">
              4
            </span>
            <h2 className="text-xl font-bold">Full Studio Layout</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            Complete studio view with tree sidebar, connection switcher in
            header, and tab-based content area.
          </p>
          <div className="ml-11">
            <StudioLayoutPreview />
          </div>
        </section>

        {/* Navigation Flow */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
              ?
            </span>
            <h2 className="text-xl font-bold">Navigation Flow</h2>
          </div>
          <div className="ml-11 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm">
            <pre className="text-gray-700 dark:text-gray-300">{`
  Home (/)                    Studio (/studio)
  ┌──────────────┐            ┌──────────────────────────┐
  │              │            │                          │
  │  Saved       │  connect   │  Tree     │  Tab Content │
  │  Connections │ ─────────► │  Sidebar  │              │
  │              │            │           │              │
  │  Quick       │            │  [Switch] │              │
  │  Connect     │            │           │              │
  └──────────────┘            └──────────────────────────┘
         ▲                              │
         │          disconnect          │
         └──────────────────────────────┘
            `}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
