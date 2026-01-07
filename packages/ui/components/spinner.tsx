'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
      },
      variant: {
        default: 'border-black border-t-transparent',
        yellow: 'border-yellow-500 border-t-transparent',
        blue: 'border-blue-500 border-t-transparent',
        white: 'border-white border-t-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

const LoadingScreen = ({
  message = 'Loading...',
  size = 'lg',
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Spinner size={size} />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl border-2 border-black bg-white p-8 shadow-offset">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-lg font-bold">{message}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { Spinner, LoadingScreen, LoadingOverlay, spinnerVariants };
