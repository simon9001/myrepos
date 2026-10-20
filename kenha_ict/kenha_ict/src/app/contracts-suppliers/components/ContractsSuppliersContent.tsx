'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, Building2 } from 'lucide-react';
import { suppliers, contracts, type Contract, type Supplier } from '@/lib/mockData';
import SupplierCard from './SupplierCard';
import ContractsTable from './ContractsTable';
import ContractDetailPanel from './ContractDetailPanel';

type ViewMode = 'suppliers' | 'contracts';

export default function ContractsSuppliersContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('contracts');
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredContracts = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.supplierName.toLowerCase().includes(q) ||
        c.refNumber.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredSuppliers = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Procurement</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Contracts & Suppliers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Vendor directory and active procurement agreements
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

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Contracts', value: contracts.length, sub: 'All time', alert: false },
          { label: 'Active Contracts', value: contracts.filter(c => c.status === 'Active').length, sub: 'Currently running', alert: false },
          { label: 'Expiring Contracts', value: contracts.filter(c => c.status === 'Expiring').length, sub: 'Require renewal', alert: true },
          { label: 'Registered Suppliers', value: suppliers.length, sub: 'Approved vendors', alert: false },
        ].map((stat) => (
          <div
            key={`cstat-${stat.label}`}
            className="card-elevated rounded-lg p-4"
            style={stat.alert ? { backgroundColor: 'var(--warning-bg)', borderColor: 'rgba(180,83,9,0.2)' } : {}}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
            <p className="text-2xl font-bold font-mono-data mt-1.5" style={{ color: stat.alert ? 'var(--warning)' : 'var(--foreground)' }}>{stat.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 rounded-md p-1 w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        {(['contracts', 'suppliers'] as ViewMode[]).map((mode) => (
          <button
            key={`csview-${mode}`}
            onClick={() => { setViewMode(mode); setSelectedContract(null); setSelectedSupplier(null); }}
            className="px-4 py-1.5 rounded text-xs font-medium transition-all duration-150"
            style={viewMode === mode
              ? { backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: 'var(--muted-foreground)' }
            }
          >
            {mode === 'contracts' ? `Contracts (${contracts.length})` : `Suppliers (${suppliers.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          placeholder={viewMode === 'contracts' ? 'Search contracts, suppliers, ref…' : 'Search suppliers, category…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-md text-xs outline-none transition-all"
          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Content */}
      {viewMode === 'contracts' ? (
        <div className={`flex flex-col lg:flex-row gap-4 ${selectedContract ? 'items-start' : ''}`}>
          <div className={`flex-1 min-w-0 ${selectedContract ? 'xl:max-w-[62%]' : ''}`}>
            <ContractsTable
              contracts={filteredContracts}
              selectedId={selectedContract?.id ?? null}
              onSelect={(c) => setSelectedContract(c)}
            />
          </div>
          {selectedContract && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 slide-in-right">
              <ContractDetailPanel contract={selectedContract} onClose={() => setSelectedContract(null)} />
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredSuppliers.length === 0 ? (
            <div className="card-elevated rounded-lg flex flex-col items-center justify-center py-16 text-center">
              <Building2 size={28} className="mb-3" style={{ color: 'var(--border)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>No suppliers found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSuppliers.map((sup) => (
                <SupplierCard
                  key={sup.id}
                  supplier={sup}
                  selected={selectedSupplier?.id === sup.id}
                  onClick={() => setSelectedSupplier(sup.id === selectedSupplier?.id ? null : sup)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}