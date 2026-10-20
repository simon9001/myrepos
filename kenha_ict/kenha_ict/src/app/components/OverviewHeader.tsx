import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

export default function OverviewHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Command Center</p>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>ICT Operations Overview</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Kenya National Highways Authority — FY 2025/26 &bull; Last updated: 11 Aug 2026, 18:26
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all duration-150"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all duration-150"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
        >
          <Download size={12} />
          Export Report
        </button>
      </div>
    </div>
  );
}