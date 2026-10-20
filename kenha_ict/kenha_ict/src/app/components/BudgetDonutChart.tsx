'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { budgetSummary } from '@/lib/mockData';

function fmt(v: number) {
  return `KES ${(v / 1_000_000).toFixed(2)}M`;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="card-elevated rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.name}</p>
      <p className="font-mono-data" style={{ color: d.payload.color }}>{fmt(d.value as number)}</p>
    </div>
  );
}

export default function BudgetDonutChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const data = budgetSummary.categories;

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="allocatedKES"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            onMouseEnter={(_, idx) => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.color}
                opacity={activeIdx === null || activeIdx === idx ? 1 : 0.4}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="space-y-1.5">
        {data.map((cat, idx) => {
          const pct = Math.round((cat.allocatedKES / budgetSummary.totalAllocatedKES) * 100);
          return (
            <li
              key={`cat-${cat.name}`}
              className="flex items-center gap-2"
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
              <span className="text-xs font-mono-data text-foreground">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}