import * as React from 'react';
import { cn } from '../lib/utils';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border-2 border-black',
              'bg-white dark:bg-transparent dark:border-white',
              'shadow-[2px_2px_0px_#000] dark:shadow-none',
              'transition-all duration-100 ease-out',
              'peer-hover:shadow-[1px_1px_0px_#000] peer-hover:translate-x-[1px] peer-hover:translate-y-[1px]',
              'dark:peer-hover:translate-x-0 dark:peer-hover:translate-y-0',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-500 peer-focus-visible:ring-offset-2',
              'peer-checked:bg-yellow-500 peer-checked:border-black',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className,
            )}
          />
          {/* Checkmark */}
          <svg
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 text-black',
              'opacity-0 peer-checked:opacity-100',
              'transition-opacity duration-100',
              'pointer-events-none',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {label && (
          <span className="text-sm font-medium text-black dark:text-white">
            {label}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
