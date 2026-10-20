'use client';

import React from 'react';
import { AlertTriangle, Clock, FileKey, FileText } from 'lucide-react';
import { renewalUrgencyItems } from '@/lib/mockData';

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="status-expired inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium">
        <AlertTriangle size={9} />
        Expired
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="status-expiring inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium">
        <Clock size={9} />
        {days}d left
      </span>
    );
  }
  if (days <= 90) {
    return (
      <span className="status-expiring inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium">
        {days}d left
      </span>
    );
  }
  return (
    <span className="status-active inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium">
      {days}d left
    </span>
  );
}

function formatKES(v: number) {
  return `KES ${(v / 1_000_000).toFixed(2)}M`;
}

export default function RenewalUrgencyList() {
  const sorted = [...renewalUrgencyItems].sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="card-elevated rounded-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Renewal Urgency Queue</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Licenses and contracts sorted by days remaining</p>
        </div>
        <span
          className="text-[10px] font-semibold rounded px-2.5 py-1"
          style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(180,83,9,0.2)' }}
        >
          {sorted.filter((i) => i.daysRemaining <= 90).length} require action
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
              {['#', 'Name', 'Type', 'Vendor', 'Renewal Cost', 'Urgency'].map((h, i) => (
                <th
                  key={`urgh-${i}`}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, idx) => (
              <tr
                key={item.id}
                className="transition-colors duration-100"
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: item.daysRemaining < 0
                    ? 'var(--danger-bg)'
                    : item.daysRemaining <= 30
                    ? 'var(--warning-bg)'
                    : 'var(--card)',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = item.daysRemaining < 0
                    ? 'var(--danger-bg)'
                    : item.daysRemaining <= 30
                    ? 'var(--warning-bg)'
                    : 'var(--card)';
                }}
              >
                <td className="px-4 py-3 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{String(idx + 1).padStart(2, '0')}</td>
                <td className="px-4 py-3 font-medium whitespace-nowrap max-w-[200px] truncate" style={{ color: 'var(--foreground)' }}>
                  {item.name}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                    {item.type === 'License' ? <FileKey size={10} /> : <FileText size={10} />}
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{item.vendor}</td>
                <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{formatKES(item.costKES)}</td>
                <td className="px-4 py-3">
                  <UrgencyBadge days={item.daysRemaining} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}