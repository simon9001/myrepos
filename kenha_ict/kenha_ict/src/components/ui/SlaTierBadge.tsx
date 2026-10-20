import React from 'react';
import type { SlaTier } from '@/lib/mockData';

const tierMap: Record<SlaTier, { cls: string; dot: string }> = {
  Platinum: { cls: 'bg-[#0c1a2e] text-[#7dd3fc] border border-[rgba(125,211,252,0.2)]', dot: '#7dd3fc' },
  Gold: { cls: 'bg-[#1c1407] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]', dot: '#fbbf24' },
  Silver: { cls: 'bg-[#1a1a1a] text-[#9ca3af] border border-[rgba(156,163,175,0.2)]', dot: '#9ca3af' },
  Bronze: { cls: 'bg-[#1a0e00] text-[#d97706] border border-[rgba(217,119,6,0.2)]', dot: '#d97706' },
};

export default function SlaTierBadge({ tier }: { tier: SlaTier }) {
  const { cls, dot } = tierMap[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      {tier}
    </span>
  );
}