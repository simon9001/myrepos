import React from 'react';

interface Dept {
  name: string;
  allocatedKES: number;
  consumedKES: number;
}

interface Props {
  departments: Dept[];
}

function formatKES(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return `${(v / 1_000).toFixed(0)}K`;
}

export default function DepartmentBars({ departments }: Props) {
  const max = Math.max(...departments.map((d) => d.allocatedKES));

  return (
    <div className="space-y-4">
      {departments.map((dept) => {
        const allocPct = (dept.allocatedKES / max) * 100;
        const consumedPct = (dept.consumedKES / dept.allocatedKES) * 100;
        const overBudget = dept.consumedKES > dept.allocatedKES;

        return (
          <div key={`dbar-${dept.name}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-700 truncate flex-1">{dept.name}</span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] font-mono-data text-gray-400">
                  KES {formatKES(dept.consumedKES)} / {formatKES(dept.allocatedKES)}
                </span>
                <span
                  className={`text-[11px] font-mono-data font-semibold ${
                    overBudget ? 'text-red-600' : consumedPct >= 85 ? 'text-amber-600' : 'text-green-600'
                  }`}
                >
                  {Math.round(consumedPct)}%
                </span>
              </div>
            </div>

            {/* Allocated bar (full width relative to max) */}
            <div className="relative h-4 bg-gray-100 rounded overflow-hidden" style={{ width: `${allocPct}%` }}>
              {/* Consumed fill */}
              <div
                className={`absolute left-0 top-0 h-full rounded transition-all duration-500 ${
                  overBudget ? 'bg-red-500' : consumedPct >= 85 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(consumedPct, 100)}%`, opacity: 0.75 }}
              />
              {/* Allocated label */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono-data text-gray-400 whitespace-nowrap">
                {formatKES(dept.allocatedKES)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {[
          { key: 'leg-alloc', color: 'bg-gray-200', label: 'Allocated' },
          { key: 'leg-consumed', color: 'bg-blue-600', label: 'Consumed' },
          { key: 'leg-warn', color: 'bg-amber-500', label: '≥ 85% consumed' },
        ].map((l) => (
          <span key={l.key} className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className={`w-3 h-2 rounded-sm ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}