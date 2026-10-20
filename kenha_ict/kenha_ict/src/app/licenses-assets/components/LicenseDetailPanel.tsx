'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { X, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import type { License } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const SeatGauge = dynamic(() => import('./SeatGauge'), { ssr: false });
const DaysGauge = dynamic(() => import('./DaysGauge'), { ssr: false });

interface Props {
  license: License;
  onClose: () => void;
}

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date('2026-08-11');
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LicenseDetailPanel({ license, onClose }: Props) {
  const days = daysUntil(license.expiryDate);
  const seatPct = Math.round((license.seatsUsed / license.seatsTotal) * 100);

  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--foreground)' }}>{license.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{license.vendor}</p>
        </div>
        <button onClick={onClose} className="transition-colors p-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
          <X size={15} />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin max-h-[calc(100vh-200px)]">
        {/* Status row */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={license.status} size="md" />
          <span className="px-2.5 py-1 rounded text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {license.category}
          </span>
          <span className="px-2.5 py-1 rounded text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            {license.department}
          </span>
        </div>

        {/* Gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Seat Utilisation</p>
            <SeatGauge pct={seatPct} used={license.seatsUsed} total={license.seatsTotal} />
          </div>
          <div className="rounded-md p-3 flex flex-col items-center" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Days Remaining</p>
            <DaysGauge days={days} />
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-0">
          {[
            { label: 'Annual Cost', value: formatKES(license.annualCostKES), mono: true },
            { label: 'Expiry Date', value: license.expiryDate, mono: true },
            { label: 'Renewal Contact', value: license.renewalContact },
          ].map((row) => (
            <div key={`meta-${row.label}`} className="flex justify-between gap-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className={`text-[11px] font-medium text-right ${row.mono ? 'font-mono-data' : ''}`} style={{ color: 'var(--foreground)' }}>
                {row.value}
              </span>
            </div>
          ))}

          {/* License Key */}
          <div className="flex justify-between items-center gap-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>License Key</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono-data" style={{ color: 'var(--foreground)' }}>{license.licenseKey}</span>
              <button className="transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <Copy size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {license.notes && (
          <div className="rounded-md p-3" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{license.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-white text-xs font-medium transition-all duration-150"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <RefreshCw size={11} />
            Initiate Renewal
          </button>
          <button
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-xs transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
          >
            <ExternalLink size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}