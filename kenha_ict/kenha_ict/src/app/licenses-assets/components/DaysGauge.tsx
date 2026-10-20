'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface Props {
  days: number;
}

export default function DaysGauge({ days }: Props) {
  const maxDays = 365;
  const clamped = Math.max(0, Math.min(days, maxDays));
  const pct = Math.round((clamped / maxDays) * 100);
  const color = days < 0 ? '#ef4444' : days <= 30 ? '#ef4444' : days <= 90 ? '#f59e0b' : '#22c55e';
  const data = [{ value: pct, fill: color }];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={90} height={90}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={42}
          startAngle={90}
          endAngle={-270}
          data={data}
          barSize={10}
        >
          <RadialBar dataKey="value" cornerRadius={5} background={{ fill: 'var(--muted)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold font-mono-data" style={{ color }}>
          {days < 0 ? '0' : days}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{days < 0 ? 'Expired' : 'days left'}</p>
    </div>
  );
}