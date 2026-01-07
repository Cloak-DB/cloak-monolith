import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-sans font-semibold transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        yellow:
          'bg-yellow-500 dark:bg-transparent text-black dark:text-yellow-500 border-2 border-black dark:border-yellow-500 shadow-offset hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]',
        blue: 'bg-blue-50 dark:bg-transparent text-black dark:text-blue-500 border-2 border-black dark:border-blue-500 shadow-offset hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]',
        outline:
          'border-2 border-black dark:border-white bg-white dark:bg-transparent text-black dark:text-white shadow-offset hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]',
        ghost:
          'border-2 border-transparent bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-white/10',
      },
      size: {
        default: 'h-11 px-4 py-2', // 44px - minimum touch target
        sm: 'h-10 px-3 text-sm', // 40px - acceptable for secondary actions
        lg: 'h-12 px-8 text-base', // 48px
        icon: 'h-11 w-11', // 44px - minimum touch target
      },
    },
    defaultVariants: {
      variant: 'yellow',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
