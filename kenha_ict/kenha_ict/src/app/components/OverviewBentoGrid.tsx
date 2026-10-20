import React from 'react';
import KpiCard from '@/components/ui/KpiCard';
import { FileKey, Clock, FileText, TrendingUp, Monitor } from 'lucide-react';

// Grid plan: 6 cards → grid-cols-3 xl:grid-cols-6 → single row at xl
// Row 1 at lg: 3 cards; Row 2: 3 cards
// At xl: all 6 in one row
export default function OverviewBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Hero: License Compliance Rate — spans 2 cols at xl */}
      <div className="xl:col-span-2">
        <KpiCard
          label="License Compliance Rate"
          value="89.3%"
          sub="10 of 12 licenses fully compliant"
          trend="down"
          trendLabel="↓ 2.4% from last quarter — 2 licenses expired or expiring"
          icon={<FileKey size={16} />}
          variant="default"
          className="h-full"
        />
      </div>

      <KpiCard
        label="Active Licenses"
        value="12"
        sub="Across 5 departments"
        trend="neutral"
        trendLabel="8 Active · 3 Expiring Soon · 1 Expired"
        icon={<FileKey size={15} />}
      />

      <KpiCard
        label="Expiring Within 90 Days"
        value="4"
        sub="Require renewal action"
        trend="alert"
        trendLabel="⚠ 1 already expired — Zoom license lapsed"
        icon={<Clock size={15} />}
        variant="alert"
      />

      <KpiCard
        label="Active Contracts"
        value="6"
        sub="of 8 total contracts"
        trend="neutral"
        trendLabel="2 Expiring · 1 Under Review · 1 Expired"
        icon={<FileText size={15} />}
      />

      <KpiCard
        label="FY Budget Consumed"
        value="74.1%"
        sub="KES 34.35M of KES 46.39M"
        trend="neutral"
        trendLabel="On track for FY 2025/26 — 11 months elapsed"
        icon={<TrendingUp size={15} />}
        variant="warning"
      />

      {/* Asset count spans remaining */}
      <KpiCard
        label="Registered Assets"
        value="6"
        sub="Hardware inventory items"
        trend="neutral"
        trendLabel="5 In Use · 1 Under Maintenance"
        icon={<Monitor size={15} />}
      />
    </div>
  );
}