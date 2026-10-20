'use client';

import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { budgetSummary, budgetItems } from '@/lib/mockData';
import dynamic from 'next/dynamic';
import DepartmentBars from './DepartmentBars';
import SpendTable from './SpendTable';

const BudgetPieChart = dynamic(() => import('./BudgetPieChart'), { ssr: false });

const fiscalYears = ['2025/26', '2024/25', '2023/24', '2022/23'];

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function pct(consumed: number, allocated: number) {
  return allocated === 0 ? 0 : Math.round((consumed / allocated) * 100);
}

export default function BudgetAnalyticsContent() {
  const [selectedFY, setSelectedFY] = useState('2025/26');
  const [fyOpen, setFyOpen] = useState(false);

  const consumedPct = pct(budgetSummary.totalConsumedKES, budgetSummary.totalAllocatedKES);
  const remaining = budgetSummary.totalAllocatedKES - budgetSummary.totalConsumedKES;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Analytics</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Budget & Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            ICT departmental budget allocation and expenditure analysis
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* FY Selector */}
          <div className="relative">
            <button
              onClick={() => setFyOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-150"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
            >
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>FY</span>
              {selectedFY}
              <ChevronDown size={11} className={`transition-transform duration-150 ${fyOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--muted-foreground)' }} />
            </button>
            {fyOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-md shadow-lg z-20 overflow-hidden border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {fiscalYears.map((fy) => (
                  <button
                    key={`fy-${fy}`}
                    onClick={() => { setSelectedFY(fy); setFyOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors duration-100"
                    style={selectedFY === fy
                      ? { backgroundColor: 'var(--info-bg)', color: 'var(--info)', fontWeight: 600 }
                      : { color: 'var(--muted-foreground)', backgroundColor: 'transparent' }
                    }
                    onMouseEnter={(e) => { if (selectedFY !== fy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--muted)'; }}
                    onMouseLeave={(e) => { if (selectedFY !== fy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                  >
                    FY {fy}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Top KPI row — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-elevated rounded-lg p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>Total Allocated</p>
          <p className="text-2xl font-bold font-mono-data mt-2" style={{ color: 'var(--foreground)' }}>
            {formatKES(budgetSummary.totalAllocatedKES)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>FY {selectedFY} ICT budget</p>
        </div>
        <div className="card-elevated rounded-lg p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>Total Consumed</p>
          <p className="text-2xl font-bold font-mono-data mt-2" style={{ color: 'var(--foreground)' }}>
            {formatKES(budgetSummary.totalConsumedKES)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{consumedPct}% of allocation used</p>
        </div>
        <div className="card-elevated rounded-lg p-5" style={remaining < 5_000_000 ? { backgroundColor: 'var(--warning-bg)', borderColor: 'rgba(180,83,9,0.2)' } : {}}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>Remaining Budget</p>
          <p className="text-2xl font-bold font-mono-data mt-2" style={{ color: remaining < 5_000_000 ? 'var(--warning)' : 'var(--foreground)' }}>
            {formatKES(remaining)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{100 - consumedPct}% unspent</p>
        </div>
        <div className="card-elevated rounded-lg p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>Budget Lines</p>
          <p className="text-2xl font-bold font-mono-data mt-2" style={{ color: 'var(--foreground)' }}>{budgetItems.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {budgetItems.filter((i) => i.consumedKES > 0).length} invoiced &bull;{' '}
            {budgetItems.filter((i) => i.consumedKES === 0).length} pending
          </p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="card-elevated rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Overall Budget Utilisation — FY {selectedFY}</p>
          <span className="text-sm font-mono-data font-bold" style={{ color: 'var(--foreground)' }}>{consumedPct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${consumedPct}%`,
              backgroundColor: consumedPct >= 90 ? 'var(--danger)' : consumedPct >= 75 ? 'var(--warning)' : 'var(--primary)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>KES 0</span>
          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{formatKES(budgetSummary.totalAllocatedKES)}</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Pie chart */}
        <div className="xl:col-span-2 card-elevated rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>Allocation by Category</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>FY {selectedFY} — KES breakdown</p>
          <BudgetPieChart />
        </div>

        {/* Department bars */}
        <div className="xl:col-span-3 card-elevated rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>Spend by Department</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Allocated vs consumed per cost centre</p>
          <DepartmentBars departments={budgetSummary.departments} />
        </div>
      </div>

      {/* Category detail cards */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Category Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {budgetSummary.categories.map((cat) => {
            const catPct = pct(cat.consumedKES, cat.allocatedKES);
            return (
              <div key={`catcard-${cat.name}`} className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{cat.name}</p>
                </div>
                <p className="text-lg font-bold font-mono-data" style={{ color: 'var(--foreground)' }}>{formatKES(cat.allocatedKES)}</p>
                <p className="text-[11px] mt-0.5 font-mono-data" style={{ color: 'var(--muted-foreground)' }}>
                  {formatKES(cat.consumedKES)} spent
                </p>
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${catPct}%`, backgroundColor: cat.color }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{catPct}% consumed</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemised spend table */}
      <SpendTable items={budgetItems} />
    </div>
  );
}