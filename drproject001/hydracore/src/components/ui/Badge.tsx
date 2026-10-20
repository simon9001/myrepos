interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'gray'
  className?: string
}

const colorClasses = {
  blue:   'bg-brand-50 text-brand-dark border border-brand-100',
  green:  'bg-green-light text-green-dark border border-green-light',
  orange: 'bg-orange-light text-orange-dark border border-orange-light',
  purple: 'bg-purple-50 text-purple-700 border border-purple-100',
  cyan:   'bg-cyan-50 text-cyan-700 border border-cyan-100',
  gray:   'bg-slate-100 text-slate-600 border border-slate-200',
}

export default function Badge({ children, color = 'blue', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  )
}
