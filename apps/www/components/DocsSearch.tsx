'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@cloak-db/ui/lib/utils';
import type { DocContent } from '@/lib/mdx';

type DocsSearchProps = {
  docs: DocContent[];
  basePath: string;
  locale: string;
};

export function DocsSearch({ docs, basePath, locale }: DocsSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const placeholder =
    locale === 'fr'
      ? 'Rechercher dans la documentation...'
      : 'Search documentation...';
  const noResults = locale === 'fr' ? 'Aucun resultat' : 'No results found';

  // Filter docs based on query
  const filteredDocs = query.trim()
    ? docs.filter((doc) => {
        const searchText =
          `${doc.meta.title} ${doc.meta.description || ''} ${doc.content}`.toLowerCase();
        return query
          .toLowerCase()
          .split(' ')
          .every((word) => searchText.includes(word));
      })
    : docs;

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle navigation within results
  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredDocs.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredDocs.length) % filteredDocs.length,
        );
      } else if (e.key === 'Enter' && filteredDocs[selectedIndex]) {
        e.preventDefault();
        router.push(
          `${basePath}/docs/${filteredDocs[selectedIndex].meta.slug}`,
        );
        setIsOpen(false);
      }
    },
    [filteredDocs, selectedIndex, router, basePath],
  );

  const handleSelect = (slug: string) => {
    router.push(`${basePath}/docs/${slug}`);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline">
          {locale === 'fr' ? 'Rechercher' : 'Search'}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNavigation}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredDocs.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {noResults}
            </div>
          ) : (
            <ul className="py-2">
              {filteredDocs.map((doc, index) => (
                <li key={doc.meta.slug}>
                  <button
                    onClick={() => handleSelect(doc.meta.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-yellow-50 dark:bg-yellow-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                  >
                    <FileText
                      size={16}
                      className={cn(
                        'flex-shrink-0',
                        index === selectedIndex
                          ? 'text-yellow-600 dark:text-yellow-500'
                          : 'text-gray-400',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          'text-sm font-medium truncate',
                          index === selectedIndex
                            ? 'text-yellow-700 dark:text-yellow-500'
                            : 'text-gray-900 dark:text-white',
                        )}
                      >
                        {doc.meta.title}
                      </div>
                      {doc.meta.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {doc.meta.description}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight
                        size={14}
                        className="text-yellow-600 dark:text-yellow-500 flex-shrink-0"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              &#8593;
            </kbd>
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              &#8595;
            </kbd>
            {locale === 'fr' ? 'naviguer' : 'navigate'}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
              &#9166;
            </kbd>
            {locale === 'fr' ? 'ouvrir' : 'open'}
          </span>
        </div>
      </div>
    </div>
  );
}
