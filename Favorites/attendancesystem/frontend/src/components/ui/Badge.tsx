import type { MeetingStatus, SessionStatus, TrainingStatus, OrgMemberRole } from '@/types';

type BadgeVariant =
  | 'purple' | 'pink' | 'orange' | 'green' | 'teal' | 'gray' | 'popular'
  | 'tag-purple' | 'tag-orange' | 'tag-green';

const variantClasses: Record<BadgeVariant, string> = {
  purple:      'bg-primary text-white',
  pink:        'bg-brand-pink text-white',
  orange:      'bg-brand-orange text-white',
  green:       'bg-success text-white',
  teal:        'bg-brand-teal text-white',
  gray:        'bg-card-gray text-stone',
  popular:     'bg-primary text-white',
  'tag-purple':'bg-card-lavender text-brand-purple-800',
  'tag-orange':'bg-card-peach text-brand-orange-deep',
  'tag-green': 'bg-card-mint text-success',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

// ── Domain-specific status badges ─────────────────────────────────────────────

const meetingStatusMap: Record<MeetingStatus, { label: string; classes: string }> = {
  draft:     { label: 'Draft',     classes: 'bg-card-gray text-stone' },
  published: { label: 'Published', classes: 'bg-card-sky text-brand-teal' },
  open:      { label: 'Open',      classes: 'bg-card-mint text-success' },
  closed:    { label: 'Closed',    classes: 'bg-hairline text-steel' },
  archived:  { label: 'Archived',  classes: 'bg-card-cream text-slate' },
};

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const { label, classes } = meetingStatusMap[status] ?? meetingStatusMap.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

const sessionStatusMap: Record<SessionStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-card-yellow text-charcoal' },
  open:    { label: 'Open',    classes: 'bg-card-mint text-success' },
  closed:  { label: 'Closed',  classes: 'bg-hairline text-steel' },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const { label, classes } = sessionStatusMap[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

const roleColors: Record<OrgMemberRole, string> = {
  super_admin:          'bg-primary text-white',
  hr_admin:             'bg-card-lavender text-brand-purple-800',
  department_admin:     'bg-card-sky text-brand-teal',
  meeting_organizer:    'bg-card-peach text-brand-orange-deep',
  training_coordinator: 'bg-card-mint text-success',
  auditor:              'bg-card-yellow text-charcoal',
  participant:          'bg-card-gray text-stone',
};

export function RoleBadge({ role }: { role: OrgMemberRole }) {
  const label = role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${roleColors[role]}`}>
      {label}
    </span>
  );
}
