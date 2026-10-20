'use client';

import React from 'react';
import { Phone, Mail, MapPin, Star, FileText } from 'lucide-react';
import type { Supplier } from '@/lib/mockData';

interface Props {
  supplier: Supplier;
  selected: boolean;
  onClick: () => void;
}

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function SupplierCard({ supplier, selected, onClick }: Props) {
  const categoryColors: Record<string, string> = {
    'ICT Hardware & Infrastructure': '#7c3aed',
    'Connectivity & Telecommunications': '#16a34a',
    'Enterprise Software & Databases': '#1d4ed8',
    'Managed ICT Services': '#d97706',
    'Fibre Internet & Connectivity': '#16a34a',
    'Cybersecurity & Consulting': '#dc2626',
    'Hardware & Peripherals': '#7c3aed',
    'Software Licensing & ERP': '#1d4ed8',
  };
  const color = categoryColors[supplier.category] ?? '#1d4ed8';

  return (
    <div
      onClick={onClick}
      className="card-elevated rounded-lg p-4 cursor-pointer transition-all duration-150 card-hover"
      style={selected ? { borderColor: 'var(--primary)', backgroundColor: 'var(--info-bg)' } : {}}
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ backgroundColor: color + '18', color }}
        >
          {initials(supplier.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--foreground)' }}>{supplier.name}</h3>
          <p className="text-[11px] mt-0.5 leading-tight line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{supplier.category}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${supplier.id}-${star}`}
            size={10}
            style={{
              color: supplier.rating >= star ? '#f59e0b' : 'var(--border)',
              fill: supplier.rating >= star ? '#f59e0b' : 'none',
            }}
          />
        ))}
        <span className="text-[11px] font-mono-data ml-1" style={{ color: 'var(--muted-foreground)' }}>{supplier.rating.toFixed(1)}</span>
      </div>

      {/* Contact details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          <Phone size={10} className="flex-shrink-0" />
          <span className="font-mono-data truncate">{supplier.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          <Mail size={10} className="flex-shrink-0" />
          <span className="truncate">{supplier.email}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          <MapPin size={10} className="flex-shrink-0" />
          <span className="truncate">{supplier.address}</span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          <FileText size={10} />
          <span>{supplier.activeContracts} active contract{supplier.activeContracts !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-[11px] font-mono-data font-semibold" style={{ color: 'var(--foreground)' }}>
          {formatKES(supplier.totalContractValueKES)}
        </span>
      </div>

      {/* Contact person */}
      <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Contact Person</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{supplier.contactPerson}</p>
      </div>
    </div>
  );
}