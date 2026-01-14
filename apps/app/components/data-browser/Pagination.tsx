'use client';

import { Button } from '@cloak-db/ui/components/button';
import { Select } from '@cloak-db/ui/components/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">
            {totalCount > 0 ? startRow : 0}-{endRow}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">
            {totalCount.toLocaleString()}
          </span>{' '}
          rows
        </span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Rows per page:
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-gray-500 dark:text-slate-400 px-2">
          Page{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">
            {currentPage}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">
            {totalPages || 1}
          </span>
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
