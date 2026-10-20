import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  helper?:  string;
  iconLeft?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, iconLeft, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-charcoal">
            {label}
          </label>
        )}

        <div className="relative">
          {iconLeft && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full h-11 px-3 rounded-md bg-canvas text-ink text-sm',
              'border border-hairline-strong placeholder:text-muted',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'transition-colors',
              error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
              iconLeft ? 'pl-9' : '',
              className,
            ].join(' ')}
            {...props}
          />
        </div>

        {error  && <p className="text-xs text-danger">{error}</p>}
        {helper && !error && <p className="text-xs text-steel">{helper}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
