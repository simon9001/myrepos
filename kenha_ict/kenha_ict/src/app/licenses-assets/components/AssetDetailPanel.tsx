'use client';

import React from 'react';
import { X, Wrench, MapPin, User } from 'lucide-react';
import type { Asset } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
  asset: Asset;
  onClose: () => void;
}

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

export default function AssetDetailPanel({ asset, onClose }: Props) {
  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      <div className="flex items-start justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{asset.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{asset.vendor}</p>
        </div>
        <button onClick={onClose} className="transition-colors p-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
          <X size={15} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={asset.status} size="md" />
          <span className="px-2.5 py-1 rounded text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{asset.category}</span>
        </div>

        <div className="space-y-0">
          {[
            { label: 'Serial Number', value: asset.serialNumber, mono: true },
            { label: 'Department', value: asset.department },
            { label: 'Purchase Date', value: asset.purchaseDate, mono: true },
            { label: 'Warranty Expiry', value: asset.warrantyExpiry, mono: true },
            { label: 'Asset Cost', value: formatKES(asset.costKES), mono: true },
          ].map((row) => (
            <div key={`ameta-${row.label}`} className="flex justify-between gap-2 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
              <span className={`text-[11px] font-medium text-right ${row.mono ? 'font-mono-data' : ''}`} style={{ color: 'var(--foreground)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-md p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
            <User size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Assigned To</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{asset.assignedTo}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
            <MapPin size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Location</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{asset.location}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-white text-xs font-medium transition-all duration-150"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Wrench size={11} />
            Log Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}