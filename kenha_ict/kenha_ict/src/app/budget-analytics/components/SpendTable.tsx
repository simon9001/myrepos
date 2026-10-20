'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import type { BudgetItem } from '@/lib/mockData';

interface Props {
  items: BudgetItem[];
}

const categoryColors: Record<string, string> = {
  Software: '#1d4ed8',
  Hardware: '#7c3aed',
  Connectivity: '#16a34a',
  Services: '#d97706',
  Security: '#dc2626',
};

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  if (v === 0) return '—';
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

export default function SpendTable({ items }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const categories = ['All', 'Software', 'Hardware', 'Connectivity', 'Services', 'Security'];

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        const matchSearch =
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.department.toLowerCase().includes(search.toLowerCase()) ||
          item.invoiceRef.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === 'All' || item.category === catFilter;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        if (sortCol === 'date') { va = a.date === '—' ? '0000' : a.date; vb = b.date === '—' ? '0000' : b.date; }
        if (sortCol === 'allocatedKES') { va = a.allocatedKES; vb = b.allocatedKES; }
        if (sortCol === 'consumedKES') { va = a.consumedKES; vb = b.consumedKES; }
        if (sortCol === 'description') { va = a.description; vb = b.description; }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, search, catFilter, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcons = ({ col }: { col: string }) => (
    <span className="flex flex-col">
      <ChevronUp size={8} style={{ color: sortCol === col && sortDir === 'asc' ? 'var(--primary)' : 'var(--border)' }} />
      <ChevronDown size={8} style={{ color: sortCol === col && sortDir === 'desc' ? 'var(--primary)' : 'var(--border)' }} />
    </span>
  );

  const totalAllocated = filtered.reduce((s, i) => s + i.allocatedKES, 0);
  const totalConsumed = filtered.reduce((s, i) => s + i.consumedKES, 0);

  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Itemised Expenditure</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>All budget line items for FY 2025/26</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter chips */}
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={`stcf-${cat}`}
                onClick={() => setCatFilter(cat)}
                className="px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-100 border"
                style={catFilter === cat
                  ? { backgroundColor: 'var(--info-bg)', color: 'var(--info)', borderColor: 'var(--info)' }
                  : { backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-md text-xs outline-none transition-all w-40"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
              {[
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category' },
                { key: 'department', label: 'Department' },
                { key: 'allocatedKES', label: 'Allocated' },
                { key: 'consumedKES', label: 'Consumed' },
                { key: 'variance', label: 'Variance' },
                { key: 'invoiceRef', label: 'Invoice Ref' },
                { key: 'date', label: 'Date' },
              ].map((col) => (
                <th
                  key={`sth-${col.key}`}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer select-none"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {['description', 'allocatedKES', 'consumedKES', 'date'].includes(col.key) && (
                      <SortIcons col={col.key} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center" style={{ color: 'var(--muted-foreground)' }}>
                  No budget items match the current filters
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const variance = item.allocatedKES - item.consumedKES;
                const consumedPct = item.allocatedKES > 0 ? Math.round((item.consumedKES / item.allocatedKES) * 100) : 0;
                const isPending = item.consumedKES === 0;

                return (
                  <tr
                    key={item.id}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--card)'}
                  >
                    <td className="px-4 py-3 font-medium max-w-[220px]" style={{ color: 'var(--foreground)' }}>
                      <span className="line-clamp-2 leading-snug">{item.description}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          backgroundColor: categoryColors[item.category] + '18',
                          color: categoryColors[item.category],
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {item.department}
                    </td>
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                      {formatKES(item.allocatedKES)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono-data" style={{ color: isPending ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                          {isPending ? 'Pending' : formatKES(item.consumedKES)}
                        </span>
                        {!isPending && (
                          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(consumedPct, 100)}%`,
                                backgroundColor: consumedPct >= 100 ? 'var(--danger)' : consumedPct >= 85 ? 'var(--warning)' : 'var(--primary)',
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap">
                      <span style={{ color: isPending ? 'var(--muted-foreground)' : variance >= 0 ? 'var(--positive)' : 'var(--danger)' }}>
                        {isPending ? '—' : (variance >= 0 ? '+' : '') + formatKES(Math.abs(variance))}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {item.invoiceRef}
                    </td>
                    <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                      {item.date}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Totals footer */}
          {filtered.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                <td className="px-4 py-3 text-xs font-semibold" colSpan={3} style={{ color: 'var(--foreground)' }}>
                  Totals ({filtered.length} items)
                </td>
                <td className="px-4 py-3 font-mono-data font-semibold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                  {formatKES(totalAllocated)}
                </td>
                <td className="px-4 py-3 font-mono-data font-semibold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                  {formatKES(totalConsumed)}
                </td>
                <td className="px-4 py-3 font-mono-data font-semibold whitespace-nowrap">
                  <span style={{ color: totalAllocated - totalConsumed >= 0 ? 'var(--positive)' : 'var(--danger)' }}>
                    {totalAllocated - totalConsumed >= 0 ? '+' : ''}
                    {formatKES(Math.abs(totalAllocated - totalConsumed))}
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}