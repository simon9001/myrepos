'use client';

import React from 'react';
import { X, RefreshCw, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { Contract } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import SlaTierBadge from '@/components/ui/SlaTierBadge';

interface Props {
  contract: Contract;
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

export default function ContractDetailPanel({ contract, onClose }: Props) {
  const daysLeft = daysUntil(contract.endDate);

  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] font-mono-data mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{contract.refNumber}</p>
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{contract.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{contract.supplierName}</p>
        </div>
        <button
          onClick={onClose}
          className="transition-colors p-0.5 flex-shrink-0"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin max-h-[calc(100vh-200px)]">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={contract.status} size="md" />
          <SlaTierBadge tier={contract.slaTier} />
        </div>

        {/* Value + days highlight */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md p-3" style={{ backgroundColor: 'var(--muted)' }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Contract Value</p>
            <p className="text-lg font-bold font-mono-data mt-1" style={{ color: 'var(--foreground)' }}>
              {formatKES(contract.valueKES)}
            </p>
          </div>
          <div
            className="rounded-md p-3"
            style={daysLeft < 0
              ? { backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(185,28,28,0.2)' }
              : daysLeft <= 90
              ? { backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(180,83,9,0.2)' }
              : { backgroundColor: 'var(--muted)' }
            }
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Days Remaining</p>
            <p
              className="text-lg font-bold font-mono-data mt-1"
              style={{ color: daysLeft < 0 ? 'var(--danger)' : daysLeft <= 90 ? 'var(--warning)' : 'var(--positive)' }}
            >
              {daysLeft < 0 ? 'Expired' : `${daysLeft}d`}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-0">
          {[
            { label: 'Department', value: contract.department },
            { label: 'Start Date', value: contract.startDate, mono: true },
            { label: 'End Date', value: contract.endDate, mono: true },
          ].map((row) => (
            <div key={`cmeta-${row.label}`} className="flex justify-between gap-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className={`text-[11px] font-medium ${row.mono ? 'font-mono-data' : ''}`} style={{ color: 'var(--foreground)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-md p-3" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Description</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{contract.description}</p>
        </div>

        {/* Milestones timeline */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Contract Milestones
          </p>
          <ol className="space-y-2.5">
            {contract.milestones.map((ms, i) => (
              <li key={`ms-${contract.id}-${i}`} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  {ms.completed ? (
                    <CheckCircle2 size={13} style={{ color: 'var(--positive)' }} />
                  ) : i === contract.milestones.findIndex((m) => !m.completed) ? (
                    <AlertCircle size={13} style={{ color: 'var(--warning)' }} />
                  ) : (
                    <Circle size={13} style={{ color: 'var(--border)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight" style={{
                    color: ms.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
                    textDecoration: ms.completed ? 'line-through' : 'none',
                  }}>
                    {ms.label}
                  </p>
                  <p className="text-[10px] font-mono-data mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{ms.date}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-white text-xs font-medium transition-all duration-150"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <RefreshCw size={11} />
            Initiate Renewal
          </button>
        </div>
      </div>
    </div>
  );
}