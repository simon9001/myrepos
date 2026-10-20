'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { monthlySpend } from '@/lib/mockData';

function formatKES(val: number) {
  if (val >= 1_000_000) return `KES ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `KES ${(val / 1_000).toFixed(0)}K`;
  return `KES ${val}`;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-elevated rounded-lg p-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.dataKey}`} className="flex justify-between gap-4">
          <span className="text-muted-foreground capitalize">{entry.name}</span>
          <span className="font-mono-data font-medium" style={{ color: entry.color }}>
            {formatKES(entry.value as number)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MonthlySpendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={monthlySpend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          {[
            { id: 'grad-sw', color: '#0ea5e9' },
            { id: 'grad-hw', color: '#8b5cf6' },
            { id: 'grad-cn', color: '#22c55e' },
            { id: 'grad-sv', color: '#f59e0b' },
            { id: 'grad-sec', color: '#ef4444' },
          ].map((g) => (
            <linearGradient key={`grad-${g.id}`} id={g.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={g.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={g.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="software" name="Software" stroke="#0ea5e9" strokeWidth={1.5} fill="url(#grad-sw)" />
        <Area type="monotone" dataKey="hardware" name="Hardware" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#grad-hw)" />
        <Area type="monotone" dataKey="connectivity" name="Connectivity" stroke="#22c55e" strokeWidth={1.5} fill="url(#grad-cn)" />
        <Area type="monotone" dataKey="services" name="Services" stroke="#f59e0b" strokeWidth={1.5} fill="url(#grad-sv)" />
        <Area type="monotone" dataKey="security" name="Security" stroke="#ef4444" strokeWidth={1.5} fill="url(#grad-sec)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}