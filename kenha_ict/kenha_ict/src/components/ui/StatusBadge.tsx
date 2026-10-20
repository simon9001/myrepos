import React from 'react';

type Status =
  | 'Active' |'Expiring Soon' |'Expired' |'Renewed' |'Under Review' |'Expiring' |'Terminated' |'In Use' |'Under Maintenance' |'Decommissioned';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusMap: Record<Status, string> = {
  'Active': 'status-active',
  'Expiring Soon': 'status-expiring',
  'Expired': 'status-expired',
  'Renewed': 'status-active',
  'Under Review': 'status-review',
  'Expiring': 'status-expiring',
  'Terminated': 'status-terminated',
  'In Use': 'status-active',
  'Under Maintenance': 'status-maintenance',
  'Decommissioned': 'status-decommissioned',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cls = statusMap[status] ?? 'status-review';
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';
  return (
    <span className={`inline-flex items-center rounded font-medium leading-none ${sizeClass} ${cls}`}>
      {status}
    </span>
  );
}