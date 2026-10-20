'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, X, SlidersHorizontal, Download } from 'lucide-react';
import { licenses, assets, type License, type Asset } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import LicenseDetailPanel from './LicenseDetailPanel';
import AssetDetailPanel from './AssetDetailPanel';

type ViewMode = 'licenses' | 'assets';
type LicenseStatusFilter = 'All' | 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed';
type CategoryFilter = 'All' | 'Security' | 'Productivity' | 'Infrastructure' | 'Development' | 'Connectivity' | 'ERP';

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

export default function LicensesAssetsContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('licenses');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LicenseStatusFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sortCol, setSortCol] = useState<string>('expiryDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredLicenses = useMemo(() => {
    return licenses
      .filter((l) => {
        const matchSearch =
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.vendor.toLowerCase().includes(search.toLowerCase()) ||
          l.department.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || l.status === statusFilter;
        const matchCat = categoryFilter === 'All' || l.category === categoryFilter;
        return matchSearch && matchStatus && matchCat;
      })
      .sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        if (sortCol === 'expiryDate') { va = a.expiryDate; vb = b.expiryDate; }
        if (sortCol === 'annualCostKES') { va = a.annualCostKES; vb = b.annualCostKES; }
        if (sortCol === 'name') { va = a.name; vb = b.name; }
        if (sortCol === 'vendor') { va = a.vendor; vb = b.vendor; }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, categoryFilter, sortCol, sortDir]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      return (
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.vendor.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <span style={{ color: 'var(--border)' }}>↕</span>;
    return <span style={{ color: 'var(--primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const statusOptions: LicenseStatusFilter[] = ['All', 'Active', 'Expiring Soon', 'Expired', 'Renewed'];
  const categoryOptions: CategoryFilter[] = ['All', 'Security', 'Productivity', 'Infrastructure', 'Development', 'Connectivity', 'ERP'];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Inventory</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Licenses & Assets</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            ICT software licenses and hardware asset inventory
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all duration-150 flex-shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 rounded-md p-1 w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        {(['licenses', 'assets'] as ViewMode[]).map((mode) => (
          <button
            key={`view-${mode}`}
            onClick={() => { setViewMode(mode); setSelectedLicense(null); setSelectedAsset(null); }}
            className="px-4 py-1.5 rounded text-xs font-medium transition-all duration-150"
            style={viewMode === mode
              ? { backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: 'var(--muted-foreground)' }
            }
          >
            {mode === 'licenses' ? `Licenses (${licenses.length})` : `Assets (${assets.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search by name, vendor, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md text-xs outline-none transition-all"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          />
        </div>

        {viewMode === 'licenses' && (
          <>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                <Filter size={10} /> Status:
              </span>
              {statusOptions.map((s) => (
                <button
                  key={`sf-${s}`}
                  onClick={() => setStatusFilter(s)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-100 border"
                  style={statusFilter === s
                    ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
                    : { backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                <SlidersHorizontal size={10} /> Category:
              </span>
              {categoryOptions.map((c) => (
                <button
                  key={`cf-${c}`}
                  onClick={() => setCategoryFilter(c)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-100 border"
                  style={categoryFilter === c
                    ? { backgroundColor: 'var(--info-bg)', color: 'var(--info)', borderColor: 'var(--info)' }
                    : { backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {(search || statusFilter !== 'All' || categoryFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('All'); setCategoryFilter('All'); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-all"
            style={{ color: 'var(--danger)' }}
          >
            <X size={10} /> Clear filters
          </button>
        )}
      </div>

      {/* Main content — table + detail panel */}
      <div className={`flex flex-col lg:flex-row gap-4 ${(selectedLicense || selectedAsset) ? 'items-start' : ''}`}>
        {/* Table */}
        <div
          className={`card-elevated rounded-lg overflow-hidden flex-1 min-w-0 ${(selectedLicense || selectedAsset) ? 'xl:max-w-[60%]' : ''}`}
        >
          {viewMode === 'licenses' ? (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                    {[
                      { key: 'name', label: 'License Name' },
                      { key: 'vendor', label: 'Vendor' },
                      { key: 'category', label: 'Category' },
                      { key: 'department', label: 'Department' },
                      { key: 'status', label: 'Status' },
                      { key: 'expiryDate', label: 'Expiry Date' },
                      { key: 'annualCostKES', label: 'Annual Cost' },
                      { key: 'seats', label: 'Seats' },
                    ].map((col) => (
                      <th
                        key={`lh-${col.key}`}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer select-none"
                        style={{ color: 'var(--muted-foreground)' }}
                        onClick={() => handleSort(col.key)}
                      >
                        <span className="flex items-center gap-1">
                          {col.label} <SortIcon col={col.key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        No licenses match the current filters
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic) => (
                      <tr
                        key={lic.id}
                        onClick={() => { setSelectedLicense(lic); setSelectedAsset(null); }}
                        className="cursor-pointer transition-colors duration-100"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: selectedLicense?.id === lic.id ? 'var(--info-bg)' : 'var(--card)',
                        }}
                        onMouseEnter={(e) => { if (selectedLicense?.id !== lic.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--muted)'; }}
                        onMouseLeave={(e) => { if (selectedLicense?.id !== lic.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--card)'; }}
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap max-w-[180px] truncate" style={{ color: 'var(--foreground)' }}>
                          {lic.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{lic.vendor}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            {lic.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{lic.department}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lic.status} />
                        </td>
                        <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{lic.expiryDate}</td>
                        <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                          {formatKES(lic.annualCostKES)}
                        </td>
                        <td className="px-4 py-3 font-mono-data whitespace-nowrap">
                          <span style={{ color: lic.seatsUsed / lic.seatsTotal >= 0.95 ? 'var(--warning)' : 'var(--foreground)' }}>
                            {lic.seatsUsed}
                          </span>
                          <span style={{ color: 'var(--muted-foreground)' }}>/{lic.seatsTotal}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                    {['Asset Name', 'Type', 'Vendor', 'Department', 'Status', 'Purchase Date', 'Value'].map((h) => (
                      <th key={`ah-${h}`} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        No assets match the current search
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr
                        key={asset.id}
                        onClick={() => { setSelectedAsset(asset); setSelectedLicense(null); }}
                        className="cursor-pointer transition-colors duration-100"
                        style={{
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: selectedAsset?.id === asset.id ? 'var(--info-bg)' : 'var(--card)',
                        }}
                        onMouseEnter={(e) => { if (selectedAsset?.id !== asset.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--muted)'; }}
                        onMouseLeave={(e) => { if (selectedAsset?.id !== asset.id) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--card)'; }}
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap max-w-[180px] truncate" style={{ color: 'var(--foreground)' }}>{asset.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{asset.type}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{asset.vendor}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{asset.department}</td>
                        <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                        <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{asset.purchaseDate}</td>
                        <td className="px-4 py-3 font-mono-data whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{formatKES(asset.valueKES)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedLicense && (
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 slide-in-right">
            <LicenseDetailPanel license={selectedLicense} onClose={() => setSelectedLicense(null)} />
          </div>
        )}
        {selectedAsset && (
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 slide-in-right">
            <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
          </div>
        )}
      </div>
    </div>
  );
}