import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  helper?:  string;
  options:  { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full h-11 px-3 rounded-md bg-canvas text-ink text-sm',
            'border border-hairline-strong',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'transition-colors appearance-none',
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : '',
            !props.value ? 'text-muted' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error  && <p className="text-xs text-danger">{error}</p>}
        {helper && !error && <p className="text-xs text-steel">{helper}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
