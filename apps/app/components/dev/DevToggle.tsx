'use client';

interface DevToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function DevToggle({
  label,
  description,
  checked,
  onChange,
}: DevToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            w-10 h-6 rounded-full transition-colors border-2 border-black
            ${checked ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}
          `}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white border-2 border-black
              transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${checked ? 'translate-x-5' : 'translate-x-1'}
            `}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
