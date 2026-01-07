import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-full border-2 px-4',
            'text-base text-black placeholder:text-gray-500 font-medium',
            'bg-white',
            'dark:bg-transparent dark:text-white dark:placeholder:text-gray-400 dark:border-white',
            'focus-visible:outline-none focus-visible:ring-0',
            'transition-all duration-100 ease-out',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-600 shadow-[6px_6px_0px_theme(colors.red.600)] focus-visible:shadow-[3px_3px_0px_theme(colors.red.600)] hover:shadow-[3px_3px_0px_theme(colors.red.600)] dark:shadow-none dark:border-red-500'
              : 'border-black shadow-offset focus-visible:shadow-[3px_3px_0px_theme(colors.black)] hover:shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-none dark:border-white',
            (error || !props.disabled) &&
              'focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] hover:translate-x-[1px] hover:translate-y-[1px] dark:focus-visible:translate-x-0 dark:focus-visible:translate-y-0 dark:hover:translate-x-0 dark:hover:translate-y-0',
            className
          )}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage ? `${props.id}-error` : undefined
          }
          {...props}
        />
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
  }
);
Input.displayName = 'Input';

export { Input };
