'use client';

import { useEffect, useRef } from 'react';
import { Table2, List, ExternalLink } from 'lucide-react';

interface SidebarContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  tableName: string;
  onClose: () => void;
  onOpenData: () => void;
  onOpenStructure: () => void;
  onOpenInNewTab: () => void;
}

export function SidebarContextMenu({
  isOpen,
  position,
  tableName,
  onClose,
  onOpenData,
  onOpenStructure,
  onOpenInNewTab,
}: SidebarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Adjust position to prevent menu from going off screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 160),
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* Table name header */}
      <div className="px-3 py-1.5 text-xs text-slate-500 border-b border-slate-700 truncate">
        {tableName}
      </div>

      <button
        onClick={() => {
          onOpenData();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 text-left"
      >
        <Table2 size={14} />
        Open Data
      </button>

      <button
        onClick={() => {
          onOpenStructure();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 text-left"
      >
        <List size={14} />
        View Structure
      </button>

      <div className="my-1 border-t border-slate-700" />

      <button
        onClick={() => {
          onOpenInNewTab();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 text-left"
      >
        <ExternalLink size={14} />
        Open in New Tab
      </button>
    </div>
  );
}
