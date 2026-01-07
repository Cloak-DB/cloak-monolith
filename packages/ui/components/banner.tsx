import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const bannerVariants = cva(
  'relative w-full text-center font-bold uppercase tracking-wide border-2 border-black text-black dark:border-white dark:text-white',
  {
    variants: {
      variant: {
        default:
          'bg-orange-100 dark:bg-transparent dark:border-orange-500 dark:text-orange-500',
        yellow:
          'bg-yellow-400 dark:bg-transparent dark:border-yellow-500 dark:text-yellow-500',
        orange:
          'bg-orange-300 dark:bg-transparent dark:border-orange-500 dark:text-orange-500',
      },
      size: {
        sm: 'px-4 py-2 text-sm shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-none',
        md: 'px-6 py-3 text-base shadow-[6px_6px_0px_theme(colors.black)] dark:shadow-none',
        lg: 'px-8 py-4 text-lg shadow-[8px_8px_0px_theme(colors.black)] dark:shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'lg',
    },
  }
);

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {}

export function Banner({
  className,
  children,
  variant,
  size,
  ...props
}: BannerProps) {
  return (
    <div
      className={cn(bannerVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </div>
  );
}
