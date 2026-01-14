'use client';

import { useCallback } from 'react';
import { Table2, List, X, Terminal } from 'lucide-react';
import { useTabs, type Tab } from '@/lib/tabs-context';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabs();

  const handleMiddleClick = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      if (e.button === 1) {
        e.preventDefault();
        closeTab(tabId);
      }
    },
    [closeTab],
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-2 overflow-x-auto">
      <div className="flex items-center gap-1 py-1">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onClick={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
            onMiddleClick={(e) => handleMiddleClick(e, tab.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  onMiddleClick: (e: React.MouseEvent) => void;
}

function TabItem({
  tab,
  isActive,
  onClick,
  onClose,
  onMiddleClick,
}: TabItemProps) {
  const getIcon = () => {
    switch (tab.type) {
      case 'data':
        return Table2;
      case 'structure':
        return List;
      case 'query':
        return Terminal;
      default:
        return Table2;
    }
  };

  const Icon = getIcon();

  const getLabel = () => {
    if (tab.type === 'query') {
      return tab.title || 'Query';
    }
    return tab.table || 'Unknown';
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={onMiddleClick}
      className={`
        group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-sm
        transition-colors duration-100 min-w-0 max-w-[200px]
        ${
          isActive
            ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-t-2 border-x border-yellow-500 border-x-gray-200 dark:border-x-slate-700'
            : 'bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-800/50'
        }
      `}
    >
      <Icon size={14} className="flex-shrink-0" />
      <span className="truncate">
        {getLabel()}
        {tab.type === 'structure' && (
          <span className="text-gray-400 dark:text-slate-500 ml-1">
            (structure)
          </span>
        )}
      </span>
      {tab.hasUnsavedChanges && (
        <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
      )}
      <span
        onClick={handleCloseClick}
        className={`
          p-0.5 rounded hover:bg-gray-300 dark:hover:bg-slate-600 flex-shrink-0
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        <X size={12} />
      </span>
    </button>
  );
}
