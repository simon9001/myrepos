import React from 'react';
import AppLayout from '@/components/AppLayout';
import OverviewBentoGrid from './components/OverviewBentoGrid';
import RenewalUrgencyList from './components/RenewalUrgencyList';
import OverviewChartsRow from './components/OverviewChartsRow';
import OverviewHeader from './components/OverviewHeader';

export default function OverviewPage() {
  return (
    <AppLayout>
      <div className="space-y-6 fade-in">
        <OverviewHeader />
        <OverviewBentoGrid />
        <OverviewChartsRow />
        <RenewalUrgencyList />
      </div>
    </AppLayout>
  );
}