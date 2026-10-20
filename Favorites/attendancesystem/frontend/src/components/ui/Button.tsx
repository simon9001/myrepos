import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'link' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  iconLeft?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-pressed active:bg-primary-deep disabled:bg-hairline disabled:text-muted',
  secondary: 'bg-transparent text-ink border border-hairline-strong hover:bg-surface active:bg-hairline',
  dark:      'bg-ink-deep text-white hover:bg-ink active:bg-charcoal',
  ghost:     'bg-transparent text-ink hover:bg-surface active:bg-hairline',
  link:      'bg-transparent text-[#0075de] hover:underline p-0 h-auto',
  danger:    'bg-danger text-white hover:opacity-90 active:opacity-80',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-[18px] py-[10px] text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, iconLeft, children, className = '', disabled, ...props }, ref) => {
    const isLink = variant === 'link';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isLink ? '' : 'rounded-md',
          variantClasses[variant],
          isLink ? '' : sizeClasses[size],
          'disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : iconLeft}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
