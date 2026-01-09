'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Database,
  Table,
  RotateCcw,
  Clock,
  User,
  Rocket,
  Bug,
  CreditCard,
  FlaskConical,
  X,
  CheckCircle2,
} from 'lucide-react';

type ProblemSolutionProps = {
  dict: {
    problemBadge: string;
    problemTitle: string;
    problemLine1: string;
    problemLine2: string;
    problemQuote: string;
    problemLine3: string;
    problemConclusion: string;
    solutionBadge: string;
    solutionTitle: string;
    solutionLine1: string;
    solutionHighlight: string;
    solutionLine2: string;
    solutionConclusion: string;
  };
};

type TableRow = {
  id: number;
  email: string;
  status: 'active' | 'pending' | 'churned' | 'trial';
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  created: string;
};

type Snapshot = {
  id: string;
  name: string;
  icon: typeof Rocket;
  color: 'purple' | 'blue' | 'orange' | 'red' | 'green';
  time: string;
  description: string;
  data: TableRow[];
  sql: string;
};

const snapshots: Snapshot[] = [
  {
    id: 'pre-ship',
    name: 'Pre-shipping state',
    icon: Rocket,
    color: 'purple',
    time: '2 hours ago',
    description: 'Before deploying v2.1',
    data: [
      {
        id: 1,
        email: 'alice@example.com',
        status: 'active',
        plan: 'pro',
        created: '2024-01-15',
      },
      {
        id: 2,
        email: 'bob@startup.io',
        status: 'active',
        plan: 'team',
        created: '2024-01-18',
      },
      {
        id: 3,
        email: 'carol@dev.co',
        status: 'active',
        plan: 'pro',
        created: '2024-01-20',
      },
      {
        id: 4,
        email: 'dan@agency.com',
        status: 'active',
        plan: 'team',
        created: '2024-01-22',
      },
      {
        id: 5,
        email: 'eve@corp.net',
        status: 'active',
        plan: 'enterprise',
        created: '2024-01-25',
      },
    ],
    sql: `-- Restoring snapshot: pre-ship
TRUNCATE TABLE users CASCADE;
COPY users FROM '/snapshots/pre-ship/users.csv';
-- Restored 5 rows ✓`,
  },
  {
    id: 'not-activated',
    name: 'User not activated',
    icon: User,
    color: 'blue',
    time: '1 day ago',
    description: 'Testing onboarding flow',
    data: [
      {
        id: 1,
        email: 'alice@example.com',
        status: 'pending',
        plan: 'free',
        created: '2024-01-15',
      },
      {
        id: 2,
        email: 'bob@startup.io',
        status: 'pending',
        plan: 'free',
        created: '2024-01-18',
      },
      {
        id: 3,
        email: 'carol@dev.co',
        status: 'pending',
        plan: 'free',
        created: '2024-01-20',
      },
    ],
    sql: `-- Restoring snapshot: not-activated
TRUNCATE TABLE users CASCADE;
COPY users FROM '/snapshots/not-activated/users.csv';
-- Restored 3 rows ✓`,
  },
  {
    id: 'payment-failed',
    name: 'Payment failed state',
    icon: CreditCard,
    color: 'orange',
    time: '2 days ago',
    description: 'Stripe webhook testing',
    data: [
      {
        id: 1,
        email: 'alice@example.com',
        status: 'active',
        plan: 'pro',
        created: '2024-01-15',
      },
      {
        id: 2,
        email: 'bob@startup.io',
        status: 'churned',
        plan: 'free',
        created: '2024-01-18',
      },
      {
        id: 3,
        email: 'carol@dev.co',
        status: 'churned',
        plan: 'free',
        created: '2024-01-20',
      },
      {
        id: 4,
        email: 'dan@agency.com',
        status: 'churned',
        plan: 'free',
        created: '2024-01-22',
      },
    ],
    sql: `-- Restoring snapshot: payment-failed
TRUNCATE TABLE users CASCADE;
COPY users FROM '/snapshots/payment-failed/users.csv';
-- Restored 4 rows ✓`,
  },
  {
    id: 'bug-repro',
    name: 'Bug reproduction',
    icon: Bug,
    color: 'red',
    time: '3 days ago',
    description: 'Issue #234 - duplicate rows',
    data: [
      {
        id: 1,
        email: 'alice@example.com',
        status: 'active',
        plan: 'pro',
        created: '2024-01-15',
      },
      {
        id: 1,
        email: 'alice@example.com',
        status: 'active',
        plan: 'team',
        created: '2024-01-15',
      },
      {
        id: 2,
        email: 'bob@startup.io',
        status: 'active',
        plan: 'team',
        created: '2024-01-18',
      },
      {
        id: 3,
        email: 'carol@dev.co',
        status: 'pending',
        plan: 'free',
        created: '2024-01-20',
      },
    ],
    sql: `-- Restoring snapshot: bug-repro
TRUNCATE TABLE users CASCADE;
COPY users FROM '/snapshots/bug-repro/users.csv';
-- Restored 4 rows (includes duplicates) ✓`,
  },
  {
    id: 'clean-test',
    name: 'Clean test data',
    icon: FlaskConical,
    color: 'green',
    time: '1 week ago',
    description: 'Fresh seed data',
    data: [
      {
        id: 1,
        email: 'test@example.com',
        status: 'active',
        plan: 'pro',
        created: '2024-01-01',
      },
      {
        id: 2,
        email: 'demo@example.com',
        status: 'trial',
        plan: 'team',
        created: '2024-01-01',
      },
    ],
    sql: `-- Restoring snapshot: clean-test
TRUNCATE TABLE users CASCADE;
COPY users FROM '/snapshots/clean-test/users.csv';
-- Restored 2 rows ✓`,
  },
];

const colorClasses = {
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const activeColorClasses = {
  purple: 'border-purple-500 bg-purple-500/10',
  blue: 'border-blue-500 bg-blue-500/10',
  orange: 'border-orange-500 bg-orange-500/10',
  red: 'border-red-500 bg-red-500/10',
  green: 'border-green-500 bg-green-500/10',
};

const statusClasses = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  trial: 'bg-blue-500/20 text-blue-400',
  churned: 'bg-red-500/20 text-red-400',
};

const staticTables = [
  { name: 'subscriptions', count: 12 },
  { name: 'invoices', count: 48 },
  { name: 'projects', count: 8 },
];

export function ProblemSolution({ dict }: ProblemSolutionProps) {
  const [activeSnapshot, setActiveSnapshot] = useState<Snapshot>(snapshots[0]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastSql, setToastSql] = useState('');
  const [displayedData, setDisplayedData] = useState<TableRow[]>(
    snapshots[0].data,
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleRestore = (snapshot: Snapshot, isUserAction = true) => {
    if (isRestoring || snapshot.id === activeSnapshot.id) return;

    if (isUserAction) {
      setHasUserInteracted(true);
    }

    setIsRestoring(true);
    setIsAnimating(true);
    setToastSql(snapshot.sql);
    setShowToast(true);

    setTimeout(() => {
      setDisplayedData(snapshot.data);
      setActiveSnapshot(snapshot);
      setIsAnimating(false);
    }, 400);

    setTimeout(() => {
      setIsRestoring(false);
    }, 600);
  };

  useEffect(() => {
    if (hasAutoTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoTriggered) {
            setTimeout(() => {
              setHasAutoTriggered(true);
              handleRestore(snapshots[1], false);
            }, 800);
          }
        });
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAutoTriggered]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white dark:bg-gray-950 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
              {dict.solutionBadge}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              {dict.solutionTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {hasUserInteracted
                ? 'Click a snapshot to see it in action ↓'
                : 'Interactive demo — try clicking a snapshot ↓'}
            </p>
          </div>

          <div className="relative mb-4 sm:mb-16">
            <div className="bg-slate-900 dark:bg-black border-2 border-black dark:border-white shadow-[8px_8px_0px_theme(colors.black)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.2)]">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 dark:bg-gray-900 border-b-2 border-black dark:border-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Cloak DB</span>
                  <span className="text-sm text-slate-500">— my_saas_dev</span>
                </div>
                <div className="w-16" />
              </div>

              <div className="flex flex-col sm:flex-row sm:min-h-[420px] md:min-h-[450px]">
                <div className="w-44 border-r border-slate-700 p-3 hidden md:block bg-slate-900/50">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    Tables
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-purple-600/20 text-purple-400 rounded text-sm">
                      <Table className="w-3.5 h-3.5" />
                      <span className="font-medium">users</span>
                      <span className="ml-auto text-xs text-purple-400/60">
                        {displayedData.length}
                      </span>
                    </div>
                    {staticTables.map((table) => (
                      <div
                        key={table.name}
                        className="flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:bg-slate-800 rounded text-sm cursor-pointer"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>{table.name}</span>
                        <span className="ml-auto text-xs text-slate-600">
                          {table.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">
                        users
                      </span>
                      <span className="text-xs text-slate-500">
                        {displayedData.length} rows
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded">
                        Filter
                      </button>
                      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded">
                        Sort
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto relative">
                    {isAnimating && (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-purple-400">
                          <RotateCcw className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-medium">
                            Restoring...
                          </span>
                        </div>
                      </div>
                    )}

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                          <th className="text-left px-2 sm:px-3 py-2 text-slate-400 font-medium">
                            id
                          </th>
                          <th className="text-left px-2 sm:px-3 py-2 text-slate-400 font-medium">
                            email
                          </th>
                          <th className="text-left px-2 sm:px-3 py-2 text-slate-400 font-medium">
                            status
                          </th>
                          <th className="text-left px-3 py-2 text-slate-400 font-medium hidden lg:table-cell">
                            plan
                          </th>
                          <th className="text-left px-3 py-2 text-slate-400 font-medium hidden lg:table-cell">
                            created_at
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedData.map((row, index) => (
                          <tr
                            key={`${row.id}-${index}`}
                            className={`border-b border-slate-800 hover:bg-slate-800/30 transition-all duration-300 ${
                              isAnimating ? 'opacity-0' : 'opacity-100'
                            }`}
                            style={{ transitionDelay: `${index * 50}ms` }}
                          >
                            <td className="px-2 sm:px-3 py-2 text-purple-400 font-mono">
                              {row.id}
                            </td>
                            <td className="px-2 sm:px-3 py-2 text-slate-300 max-w-[120px] sm:max-w-none truncate">
                              {row.email}
                            </td>
                            <td className="px-2 sm:px-3 py-2">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${statusClasses[row.status]}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-400 hidden lg:table-cell">
                              {row.plan}
                            </td>
                            <td className="px-3 py-2 text-slate-500 font-mono text-xs hidden lg:table-cell">
                              {row.created}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="order-first sm:order-last w-full sm:w-56 md:w-64 lg:w-72 border-t sm:border-t-0 sm:border-l border-slate-700 bg-slate-900/80 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 sm:py-3 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">
                        Snapshots
                      </span>
                    </div>
                    <button className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded">
                      + New
                    </button>
                  </div>

                  <div className="flex-1 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto p-2 flex sm:flex-col gap-2 sm:space-y-0">
                    {snapshots.map((snapshot, index) => {
                      const Icon = snapshot.icon;
                      const isActive = snapshot.id === activeSnapshot.id;
                      const showTryIt = !hasUserInteracted && index === 2;

                      return (
                        <button
                          key={snapshot.id}
                          onClick={() => handleRestore(snapshot)}
                          disabled={isRestoring}
                          className={`group flex-shrink-0 w-40 sm:w-full text-left bg-slate-800/50 border rounded p-2 sm:p-3 transition-all relative ${
                            isActive
                              ? activeColorClasses[snapshot.color]
                              : 'border-slate-700 hover:border-purple-500/50 cursor-pointer'
                          } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''} ${
                            showTryIt
                              ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900'
                              : ''
                          }`}
                        >
                          {showTryIt && (
                            <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-[10px] sm:text-xs bg-purple-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-black animate-bounce shadow-[0_0_20px_rgba(168,85,247,0.7)] border-2 border-white">
                              Try it!
                            </span>
                          )}
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div
                              className={`p-1 sm:p-1.5 rounded border ${colorClasses[snapshot.color]}`}
                            >
                              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-medium text-white truncate">
                                  {snapshot.name}
                                </span>
                                {isActive && (
                                  <span className="text-[8px] sm:text-[10px] bg-green-500/20 text-green-400 px-1 sm:px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] sm:text-xs text-slate-500 truncate">
                                {snapshot.description}
                              </div>
                              <div className="text-[10px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1">
                                {snapshot.time}
                              </div>
                            </div>
                          </div>
                          {!isActive && (
                            <div className="mt-1.5 sm:mt-2 w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-purple-600/20 sm:hover:bg-purple-600 text-purple-400 sm:hover:text-white text-[10px] sm:text-xs font-bold py-1 sm:py-1.5 rounded border border-purple-500/30 sm:hover:border-purple-500 transition-all sm:opacity-0 sm:group-hover:opacity-100">
                              <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Restore
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop toast - overlaid */}
            <div
              className={`hidden sm:block absolute bottom-4 right-4 w-96 z-30 transition-all duration-300 ${
                showToast
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <div className="bg-slate-950 border-2 border-green-500 shadow-[4px_4px_0px_theme(colors.green.600)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 border-b border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-green-400">
                      Snapshot Restored
                    </span>
                  </div>
                  <button
                    onClick={() => setShowToast(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {toastSql}
                  </pre>
                </div>
                <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    No magic — just SQL under the hood
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile toast - below the demo */}
          <div
            className={`sm:hidden mt-2 transition-all duration-300 ${
              showToast
                ? 'opacity-100 max-h-96'
                : 'opacity-0 max-h-0 overflow-hidden'
            }`}
          >
            <div className="bg-slate-950 border-2 border-green-500 shadow-[4px_4px_0px_theme(colors.green.600)] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 border-b border-green-500/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-400">
                    Snapshot Restored
                  </span>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {toastSql}
                </pre>
              </div>
              <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                  No magic — just SQL under the hood
                </p>
              </div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto pt-4">
            <p className="text-lg text-slate-600 dark:text-gray-400 mb-4">
              {dict.solutionLine2}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {dict.solutionConclusion}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
