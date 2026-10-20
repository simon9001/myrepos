'use client';

import React, { useState } from 'react';
import type { Contract } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import SlaTierBadge from '@/components/ui/SlaTierBadge';

interface Props {
  contracts: Contract[];
  selectedId: string | null;
  onSelect: (c: Contract) => void;
}

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

export default function ContractsTable({ contracts, selectedId, onSelect }: Props) {
  const [sortCol, setSortCol] = useState('endDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = [...contracts].sort((a, b) => {
    let va: string | number = '';
    let vb: string | number = '';
    if (sortCol === 'endDate') { va = a.endDate; vb = b.endDate; }
    if (sortCol === 'valueKES') { va = a.valueKES; vb = b.valueKES; }
    if (sortCol === 'name') { va = a.name; vb = b.name; }
    if (sortCol === 'supplierName') { va = a.supplierName; vb = b.supplierName; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span style={{ color: 'var(--border)' }}>↕</span>;
    return <span style={{ color: 'var(--primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const columns = [
    { key: 'refNumber', label: 'Ref No.' },
    { key: 'name', label: 'Contract Name' },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'department', label: 'Department' },
    { key: 'valueKES', label: 'Value (KES)' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'slaTier', label: 'SLA Tier' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
              {columns.map((col) => (
                <th
                  key={`cth-${col.key}`}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer select-none"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                  No contracts match your search
                </td>
              </tr>
            ) : (
              sorted.map((con) => (
                <tr
                  key={con.id}
                  onClick={() => onSelect(con)}
                  className="cursor-pointer transition-colors duration-100"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: selectedId === con.id ? 'var(--info-bg)' : 'var(--card)',
                  }}
                  onMouseEnter={(e) => { if (selectedId !== con.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--muted)'; }}
                  onMouseLeave={(e) => { if (selectedId !== con.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--card)'; }}
                >
                  <td className="px-4 py-3 font-mono-data whitespace-nowrap text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    {con.refNumber}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap max-w-[200px] truncate" style={{ color: 'var(--foreground)' }}>
                    {con.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{con.supplierName}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{con.department}</td>
                  <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                    {formatKES(con.valueKES)}
                  </td>
                  <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{con.startDate}</td>
                  <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{con.endDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SlaTierBadge tier={con.slaTier} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={con.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          Showing {sorted.length} of {contracts.length} contracts
        </span>
        <span className="text-[11px] font-mono-data" style={{ color: 'var(--foreground)' }}>
          Total value: KES {(contracts.reduce((s, c) => s + c.valueKES, 0) / 1_000_000).toFixed(2)}M
        </span>
      </div>
    </div>
  );
}