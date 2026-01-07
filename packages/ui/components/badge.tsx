import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-[2px_2px_0px_theme(colors.black)] dark:shadow-none',
  {
    variants: {
      variant: {
        default:
          'border-black bg-white text-black dark:border-white dark:bg-transparent dark:text-white',
        yellow:
          'border-black dark:border-yellow-500 bg-yellow-500 text-black dark:bg-transparent dark:text-yellow-500',
        blue: 'border-black dark:border-blue-500 bg-blue-500 text-white dark:bg-transparent dark:text-blue-500',
        green:
          'border-black dark:border-green-500 bg-green-500 text-white dark:bg-transparent dark:text-green-500',
        red: 'border-black dark:border-red-400 bg-red-700 text-white dark:bg-transparent dark:text-red-400',
        purple:
          'border-black dark:border-purple-500 bg-purple-500 text-white dark:bg-transparent dark:text-purple-500',
        outline:
          'border-black bg-transparent text-black dark:border-white dark:text-white shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
