'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'default', duration = 5000) => {
      const id = Math.random().toString(36).slice(2, 11);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'success', duration),
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'error', duration),
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'warning', duration),
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const toastVariants = cva(
  'pointer-events-auto relative flex w-full max-w-md items-center justify-between gap-3 overflow-hidden rounded-lg border-2 border-black p-4 shadow-offset dark:shadow-none transition-all',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black dark:bg-gray-900 dark:text-white dark:border-gray-700',
        success:
          'bg-green-50 text-black border-green-600 dark:bg-green-950 dark:text-green-400 dark:border-green-700',
        error:
          'bg-red-50 text-black border-red-600 dark:bg-red-950 dark:text-red-400 dark:border-red-700',
        warning:
          'bg-yellow-50 text-black border-yellow-600 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-700',
        info: 'bg-blue-50 text-black border-blue-600 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-3 p-6 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        toastVariants({ variant: toast.variant }),
        'animate-in slide-in-from-right-full',
      )}
      role="alert"
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-md p-1 hover:bg-black/10 transition-colors"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
