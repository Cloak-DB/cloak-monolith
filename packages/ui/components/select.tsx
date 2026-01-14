import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  errorMessage?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'flex h-12 w-full rounded-full border-2 px-4 cursor-pointer',
              'text-base text-black font-medium',
              'bg-white',
              'dark:bg-transparent dark:text-white dark:border-white',
              'focus-visible:outline-none focus-visible:ring-0',
              'transition-all duration-100 ease-out',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'appearance-none pr-10',
              error
                ? 'border-red-600 shadow-[6px_6px_0px_theme(colors.red.600)] focus-visible:shadow-[3px_3px_0px_theme(colors.red.600)] hover:shadow-[3px_3px_0px_theme(colors.red.600)] dark:shadow-none dark:border-red-500'
                : 'border-black shadow-offset focus-visible:shadow-[3px_3px_0px_theme(colors.black)] hover:shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-none dark:border-white',
              (error || !props.disabled) &&
                'focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] hover:translate-x-[1px] hover:translate-y-[1px] dark:focus-visible:translate-x-0 dark:focus-visible:translate-y-0 dark:hover:translate-x-0 dark:hover:translate-y-0',
              className,
            )}
            aria-invalid={error}
            aria-describedby={
              error && errorMessage ? `${props.id}-error` : undefined
            }
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={20} className="text-black dark:text-white" />
          </div>
        </div>
        {error && errorMessage && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-red-600 font-medium px-4 dark:text-red-500"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
