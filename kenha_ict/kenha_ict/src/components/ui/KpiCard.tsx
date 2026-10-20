import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral' | 'alert';
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'alert' | 'warning' | 'positive';
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {},
  alert: { backgroundColor: 'var(--danger-bg)', borderColor: 'rgba(185,28,28,0.2)' },
  warning: { backgroundColor: 'var(--warning-bg)', borderColor: 'rgba(180,83,9,0.2)' },
  positive: { backgroundColor: 'var(--positive-bg)', borderColor: 'rgba(21,128,61,0.2)' },
};

const trendColors: Record<string, string> = {
  up: 'var(--positive)',
  down: 'var(--danger)',
  neutral: 'var(--muted-foreground)',
  alert: 'var(--warning)',
};

export default function KpiCard({
  label,
  value,
  sub,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  className = '',
}: KpiCardProps) {
  return (
    <div
      className={`card-elevated rounded-lg p-5 flex flex-col gap-3 ${className}`}
      style={variantStyles[variant]}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] leading-tight" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
        {icon && (
          <span className="flex-shrink-0" style={{ color: 'var(--border)' }}>{icon}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-hero-value font-mono-data" style={{ color: 'var(--foreground)' }}>{value}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
      {trendLabel && (
        <p className="text-[11px] font-medium" style={{ color: trend ? trendColors[trend] : 'var(--muted-foreground)' }}>
          {trendLabel}
        </p>
      )}
    </div>
  );
}