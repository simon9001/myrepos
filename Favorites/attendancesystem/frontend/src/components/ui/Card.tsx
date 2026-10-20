import type { HTMLAttributes } from 'react';

type Tint = 'none' | 'peach' | 'rose' | 'mint' | 'lavender' | 'sky' | 'yellow' | 'yellow-bold' | 'cream' | 'gray';

const tintClasses: Record<Tint, string> = {
  none:        'bg-canvas border border-hairline',
  peach:       'bg-card-peach border border-card-peach',
  rose:        'bg-card-rose border border-card-rose',
  mint:        'bg-card-mint border border-card-mint',
  lavender:    'bg-card-lavender border border-card-lavender',
  sky:         'bg-card-sky border border-card-sky',
  yellow:      'bg-card-yellow border border-card-yellow',
  'yellow-bold': 'bg-card-yellow-bold border border-card-yellow-bold',
  cream:       'bg-card-cream border border-card-cream',
  gray:        'bg-card-gray border border-card-gray',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tint?:    Tint;
  padding?: 'sm' | 'md' | 'lg';
  shadow?:  boolean;
}

const paddingClasses = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({
  tint = 'none',
  padding = 'md',
  shadow = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg',
        tintClasses[tint],
        paddingClasses[padding],
        shadow ? 'shadow-card' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

// Stat card used in dashboard
interface StatCardProps {
  label:   string;
  value:   string | number;
  tint?:   Tint;
  icon?:   React.ReactNode;
  trend?:  { value: number; label: string };
}

export function StatCard({ label, value, tint = 'sky', icon, trend }: StatCardProps) {
  return (
    <Card tint={tint} padding="md" className="flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-charcoal/70 truncate">{label}</p>
        {icon && <span className="text-charcoal/50 shrink-0">{icon}</span>}
      </div>
      <p className="text-h3 font-semibold text-charcoal">{value}</p>
      {trend && (
        <p className="text-xs text-steel">
          <span className={trend.value >= 0 ? 'text-success' : 'text-danger'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>{' '}
          {trend.label}
        </p>
      )}
    </Card>
  );
}
