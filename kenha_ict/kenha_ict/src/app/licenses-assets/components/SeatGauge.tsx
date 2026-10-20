'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface Props {
  pct: number;
  used: number;
  total: number;
}

export default function SeatGauge({ pct, used, total }: Props) {
  const color = pct >= 95 ? '#f59e0b' : pct >= 80 ? '#0ea5e9' : '#22c55e';
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
        <span className="text-sm font-bold font-mono-data" style={{ color }}>{pct}%</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 font-mono-data">{used}/{total} seats</p>
    </div>
  );
}