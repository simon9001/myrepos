'use client';

import React, { useState, useMemo } from 'react';
import { Printer, FileText, BarChart3 } from 'lucide-react';
import { licenses, contracts, budgetItems, ictAssets, type License, type Contract, type BudgetItem, type IctAsset } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type ReportType = 'licenses' | 'contracts' | 'budget' | 'assets';

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function fmtDate(d: string) {
  if (!d || d === '—') return d;
  try { return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; }
}

const STATUS_COLORS: Record<string, string> = {
  'Active': '#15803d', 'Expiring Soon': '#b45309', 'Expired': '#b91c1c', 'Renewed': '#1d4ed8',
  'Expiring': '#b45309', 'Under Review': '#1d4ed8', 'Terminated': '#6d28d9',
  'Issued': '#1d4ed8', 'Available': '#15803d', 'Damaged': '#b91c1c',
  'Under Maintenance': '#92400e', 'Due for Maintenance': '#c2410c', 'Decommissioned': '#374151',
};

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card-elevated rounded-lg p-4">
      <p className="text-[11px] mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-2xl font-bold font-mono-data" style={{ color: color ?? 'var(--foreground)' }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
    </div>
  );
}

// ─── LICENSES REPORT ──────────────────────────────────────────────────────────
function LicensesReport() {
  const active = licenses.filter(l => l.status === 'Active').length;
  const expiring = licenses.filter(l => l.status === 'Expiring Soon').length;
  const expired = licenses.filter(l => l.status === 'Expired').length;
  const totalCost = licenses.reduce((s, l) => s + l.annualCostKES, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, { count: number; cost: number }> = {};
    licenses.forEach(l => {
      if (!map[l.category]) map[l.category] = { count: 0, cost: 0 };
      map[l.category].count++;
      map[l.category].cost += l.annualCostKES;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, []);

  const statusData = [
    { name: 'Active', value: active, fill: '#15803d' },
    { name: 'Expiring Soon', value: expiring, fill: '#b45309' },
    { name: 'Expired', value: expired, fill: '#b91c1c' },
    { name: 'Renewed', value: licenses.filter(l => l.status === 'Renewed').length, fill: '#1d4ed8' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Licenses" value={licenses.length} />
        <SummaryCard label="Active" value={active} color="#15803d" />
        <SummaryCard label="Expiring Soon" value={expiring} color="#b45309" />
        <SummaryCard label="Annual Cost" value={formatKES(totalCost)} color="var(--primary)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Status Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Licenses']} contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Cost by Category (KES)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCategory} margin={{ left: 0, right: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [formatKES(Number(v)), 'Cost']} contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Bar dataKey="cost" fill="var(--primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>All Licenses — Detailed Report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['License Name', 'Vendor', 'Category', 'Department', 'Status', 'Expiry Date', 'Annual Cost', 'Seats Used/Total'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licenses.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                  <td className="px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>{l.name}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{l.vendor}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{l.category}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{l.department}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${STATUS_COLORS[l.status]}18`, color: STATUS_COLORS[l.status] }}>{l.status}</span>
                  </td>
                  <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{fmtDate(l.expiryDate)}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{formatKES(l.annualCostKES)}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{l.seatsUsed}/{l.seatsTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── CONTRACTS REPORT ─────────────────────────────────────────────────────────
function ContractsReport() {
  const active = contracts.filter(c => c.status === 'Active').length;
  const expiring = contracts.filter(c => c.status === 'Expiring').length;
  const totalValue = contracts.reduce((s, c) => s + c.valueKES, 0);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    contracts.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] ?? '#6b7280' }));
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Contracts" value={contracts.length} />
        <SummaryCard label="Active" value={active} color="#15803d" />
        <SummaryCard label="Expiring" value={expiring} color="#b45309" />
        <SummaryCard label="Total Value" value={formatKES(totalValue)} color="var(--primary)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Contracts by Status</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {byStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Contract Values (KES)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={contracts.slice(0, 6).map(c => ({ name: c.supplierName.split(' ')[0], value: c.valueKES }))} margin={{ left: 0, right: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [formatKES(Number(v)), 'Value']} contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>All Contracts — Detailed Report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Ref Number', 'Contract Name', 'Supplier', 'Department', 'Status', 'SLA Tier', 'Value', 'Start Date', 'End Date'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                  <td className="px-3 py-2 font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{c.refNumber}</td>
                  <td className="px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{c.supplierName}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{c.department}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${STATUS_COLORS[c.status]}18`, color: STATUS_COLORS[c.status] }}>{c.status}</span>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{c.slaTier}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{formatKES(c.valueKES)}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{fmtDate(c.startDate)}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{fmtDate(c.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── BUDGET REPORT ────────────────────────────────────────────────────────────
function BudgetReport() {
  const totalAllocated = budgetItems.reduce((s, b) => s + b.allocatedKES, 0);
  const totalConsumed = budgetItems.reduce((s, b) => s + b.consumedKES, 0);
  const utilPct = Math.round((totalConsumed / totalAllocated) * 100);

  const byCategory = useMemo(() => {
    const map: Record<string, { allocated: number; consumed: number }> = {};
    budgetItems.forEach(b => {
      if (!map[b.category]) map[b.category] = { allocated: 0, consumed: 0 };
      map[b.category].allocated += b.allocatedKES;
      map[b.category].consumed += b.consumedKES;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v, pct: Math.round((v.consumed / v.allocated) * 100) }));
  }, []);

  const catColors = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Allocated" value={formatKES(totalAllocated)} />
        <SummaryCard label="Total Consumed" value={formatKES(totalConsumed)} color="var(--primary)" />
        <SummaryCard label="Remaining" value={formatKES(totalAllocated - totalConsumed)} color="#15803d" />
        <SummaryCard label="Utilization" value={`${utilPct}%`} color={utilPct >= 90 ? '#b91c1c' : utilPct >= 70 ? '#b45309' : '#15803d'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Allocation by Category</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byCategory} dataKey="allocated" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {byCategory.map((_, i) => <Cell key={i} fill={catColors[i % catColors.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [formatKES(Number(v)), 'Allocated']} contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Utilization by Category</p>
          <div className="space-y-2.5">
            {byCategory.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: 'var(--foreground)' }}>{c.name}</span>
                  <span className="font-mono-data" style={{ color: 'var(--muted-foreground)' }}>{c.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: catColors[i % catColors.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>All Budget Items — Detailed Report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Description', 'Category', 'Department', 'Allocated', 'Consumed', 'Utilization', 'Invoice Ref', 'Date'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetItems.map(b => {
                const pct = b.allocatedKES > 0 ? Math.round((b.consumedKES / b.allocatedKES) * 100) : 0;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>{b.description}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{b.category}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{b.department}</td>
                    <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--foreground)' }}>{formatKES(b.allocatedKES)}</td>
                    <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--foreground)' }}>{formatKES(b.consumedKES)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? '#b91c1c' : pct >= 80 ? '#b45309' : '#15803d' }} />
                        </div>
                        <span className="font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{b.invoiceRef}</td>
                    <td className="px-3 py-2 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{fmtDate(b.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ASSETS REPORT ────────────────────────────────────────────────────────────
function AssetsReport() {
  const total = ictAssets.length;
  const issued = ictAssets.filter(a => a.status === 'Issued').length;
  const available = ictAssets.filter(a => a.status === 'Available').length;
  const damaged = ictAssets.filter(a => a.status === 'Damaged').length;
  const maintenance = ictAssets.filter(a => a.status === 'Under Maintenance' || a.status === 'Due for Maintenance').length;

  const byType = useMemo(() => {
    const map: Record<string, { total: number; issued: number; available: number; damaged: number }> = {};
    ictAssets.forEach(a => {
      if (!map[a.type]) map[a.type] = { total: 0, issued: 0, available: 0, damaged: 0 };
      map[a.type].total++;
      if (a.status === 'Issued') map[a.type].issued++;
      if (a.status === 'Available') map[a.type].available++;
      if (a.status === 'Damaged') map[a.type].damaged++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, []);

  const statusData = [
    { name: 'Issued', value: issued, fill: '#1d4ed8' },
    { name: 'Available', value: available, fill: '#15803d' },
    { name: 'Damaged', value: damaged, fill: '#b91c1c' },
    { name: 'Maintenance', value: maintenance, fill: '#b45309' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryCard label="Total Assets" value={total} />
        <SummaryCard label="Issued" value={issued} color="#1d4ed8" />
        <SummaryCard label="Available" value={available} color="#15803d" />
        <SummaryCard label="Damaged" value={damaged} color="#b91c1c" />
        <SummaryCard label="Needs Maintenance" value={maintenance} color="#b45309" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Status Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-elevated rounded-lg p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Assets by Type</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byType} margin={{ left: 0, right: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
              <Bar dataKey="issued" name="Issued" fill="#1d4ed8" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" name="Available" fill="#15803d" stackId="a" />
              <Bar dataKey="damaged" name="Damaged" fill="#b91c1c" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>All ICT Assets — Detailed Report</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Asset Tag', 'Type', 'Model', 'Serial Number', 'Department', 'Location', 'Status', 'Issued To', 'Cost'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ictAssets.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                  <td className="px-3 py-2 font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{a.assetTag}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{a.type}</td>
                  <td className="px-3 py-2 font-medium" style={{ color: 'var(--foreground)' }}>{a.model}</td>
                  <td className="px-3 py-2 font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{a.serialNumber}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{a.department}</td>
                  <td className="px-3 py-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{a.location}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status] }}>{a.status}</span>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>{a.issuedTo || '—'}</td>
                  <td className="px-3 py-2 font-mono-data text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{formatKES(a.costKES)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN REPORTING ───────────────────────────────────────────────────────────
export default function ReportingContent() {
  const [report, setReport] = useState<ReportType>('licenses');

  const tabs: { key: ReportType; label: string; icon: React.ReactNode }[] = [
    { key: 'licenses', label: 'Licenses Report', icon: <FileText size={14} /> },
    { key: 'contracts', label: 'Contracts Report', icon: <FileText size={14} /> },
    { key: 'budget', label: 'Budget Report', icon: <BarChart3 size={14} /> },
    { key: 'assets', label: 'ICT Assets Report', icon: <Printer size={14} /> },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Analytics</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Reporting Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Comprehensive reports for licenses, contracts, budget, and ICT assets
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex-shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
        >
          <Printer size={13} />
          Print Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setReport(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${report === t.key ? 'shadow-sm' : ''}`}
            style={report === t.key
              ? { backgroundColor: 'var(--card)', color: 'var(--foreground)' }
              : { color: 'var(--muted-foreground)' }
            }
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {report === 'licenses' && <LicensesReport />}
      {report === 'contracts' && <ContractsReport />}
      {report === 'budget' && <BudgetReport />}
      {report === 'assets' && <AssetsReport />}
    </div>
  );
}
