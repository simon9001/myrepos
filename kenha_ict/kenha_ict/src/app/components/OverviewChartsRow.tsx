'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MonthlySpendChart = dynamic(() => import('./MonthlySpendChart'), { ssr: false });
const BudgetDonutChart = dynamic(() => import('./BudgetDonutChart'), { ssr: false });

export default function OverviewChartsRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 card-elevated rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Monthly IT Spend — FY 2025/26</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Cumulative spend by category (KES)</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { key: 'legend-sw', label: 'Software', color: '#1d4ed8' },
              { key: 'legend-hw', label: 'Hardware', color: '#7c3aed' },
              { key: 'legend-cn', label: 'Connectivity', color: '#16a34a' },
              { key: 'legend-sv', label: 'Services', color: '#d97706' },
              { key: 'legend-sec', label: 'Security', color: '#dc2626' },
            ]?.map((l) => (
              <span key={l?.key} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: l?.color }} />
                {l?.label}
              </span>
            ))}
          </div>
        </div>
        <MonthlySpendChart />
      </div>
      <div className="card-elevated rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>FY Budget by Category</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>KES 46.39M total allocation</p>
        <BudgetDonutChart />
      </div>
    </div>
  );
}