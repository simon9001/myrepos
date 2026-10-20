'use client';

import React, { useState, useMemo } from 'react';
import { Printer, Monitor, Laptop, Search, Plus, X, Edit2, Save, Trash2, CheckCircle, AlertTriangle, XCircle, Clock, Package } from 'lucide-react';
import { ictAssets, type IctAsset, type IctAssetType, type IctAssetStatus } from '@/lib/mockData';

const TYPE_ICONS: Record<IctAssetType, React.ReactNode> = {
  Printer: <Printer size={14} />,
  PC: <Monitor size={14} />,
  Scanner: <Package size={14} />,
  Mouse: <Package size={14} />,
  Laptop: <Laptop size={14} />,
  Projector: <Monitor size={14} />,
  Monitor: <Monitor size={14} />,
  Keyboard: <Package size={14} />,
  Switch: <Package size={14} />,
  UPS: <Package size={14} />,
};

const STATUS_CONFIG: Record<IctAssetStatus, { label: string; className: string; icon: React.ReactNode }> = {
  'Issued': { label: 'Issued', className: 'status-review', icon: <CheckCircle size={11} /> },
  'Available': { label: 'Available', className: 'status-active', icon: <CheckCircle size={11} /> },
  'Damaged': { label: 'Damaged', className: 'status-expired', icon: <XCircle size={11} /> },
  'Under Maintenance': { label: 'Under Maintenance', className: 'status-maintenance', icon: <Clock size={11} /> },
  'Due for Maintenance': { label: 'Due for Maintenance', className: 'status-expiring', icon: <AlertTriangle size={11} /> },
  'Decommissioned': { label: 'Decommissioned', className: 'status-decommissioned', icon: <XCircle size={11} /> },
};

const ASSET_TYPES: IctAssetType[] = ['Printer', 'PC', 'Scanner', 'Mouse', 'Laptop', 'Projector', 'Monitor', 'Keyboard', 'Switch', 'UPS'];
const ASSET_STATUSES: IctAssetStatus[] = ['Issued', 'Available', 'Damaged', 'Under Maintenance', 'Due for Maintenance', 'Decommissioned'];

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EMPTY_ASSET: Omit<IctAsset, 'id'> = {
  assetTag: '',
  type: 'PC',
  model: '',
  serialNumber: '',
  manufacturer: '',
  department: '',
  location: '',
  status: 'Available',
  issuedTo: null,
  issuedDate: null,
  purchaseDate: '',
  warrantyExpiry: '',
  costKES: 0,
  notes: '',
};

export default function IctAssetsContent() {
  const [assets, setAssets] = useState<IctAsset[]>(ictAssets);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<IctAssetType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<IctAssetStatus | 'All'>('All');
  const [selected, setSelected] = useState<IctAsset | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<IctAsset>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState<Omit<IctAsset, 'id'>>(EMPTY_ASSET);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.model.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        (a.issuedTo?.toLowerCase().includes(q) ?? false);
      const matchType = typeFilter === 'All' || a.type === typeFilter;
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  // Summary stats from current assets
  const stats = useMemo(() => {
    const total = assets.length;
    const issued = assets.filter(a => a.status === 'Issued').length;
    const available = assets.filter(a => a.status === 'Available').length;
    const damaged = assets.filter(a => a.status === 'Damaged').length;
    const maintenance = assets.filter(a => a.status === 'Under Maintenance').length;
    const dueMaintenance = assets.filter(a => a.status === 'Due for Maintenance').length;
    return { total, issued, available, damaged, maintenance, dueMaintenance };
  }, [assets]);

  const byType = useMemo(() => {
    return ASSET_TYPES.map(type => ({
      type,
      count: assets.filter(a => a.type === type).length,
    })).filter(t => t.count > 0);
  }, [assets]);

  const handleEdit = () => {
    if (!selected) return;
    setEditData({ ...selected });
    setEditMode(true);
  };

  const handleSave = () => {
    if (!selected) return;
    const updated = assets.map(a => a.id === selected.id ? { ...a, ...editData } as IctAsset : a);
    setAssets(updated);
    const updatedSelected = updated.find(a => a.id === selected.id) || null;
    setSelected(updatedSelected);
    setEditMode(false);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleAdd = () => {
    const id = `ict-${String(assets.length + 1).padStart(3, '0')}`;
    const asset: IctAsset = { id, ...newAsset };
    setAssets(prev => [...prev, asset]);
    setShowAddModal(false);
    setNewAsset(EMPTY_ASSET);
    setSelected(asset);
  };

  const kpiCards = [
    { label: 'Total Assets', value: stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Issued', value: stats.issued, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Available', value: stats.available, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Damaged', value: stats.damaged, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Under Maintenance', value: stats.maintenance, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Due for Maintenance', value: stats.dueMaintenance, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Asset Management</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>ICT Assets & Issuance</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Track all ICT assets — printers, PCs, laptops, scanners, projectors and more
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all duration-150 flex-shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={13} />
          Add Asset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className={`rounded-lg p-3 border ${k.bg}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className={`text-2xl font-bold font-mono-data ${k.color}`}>{k.value}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* By Type Summary */}
      <div className="card-elevated rounded-lg p-4">
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>Assets by Category</p>
        <div className="flex flex-wrap gap-2">
          {byType.map(({ type, count }) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'All' : type)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                typeFilter === type
                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :''
              }`}
              style={typeFilter !== type ? { borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' } : {}}
            >
              {TYPE_ICONS[type]}
              {type}
              <span className="font-mono-data font-semibold">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model, serial number, tag, department, issued to..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
              <X size={12} />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IctAssetStatus | 'All')}
          className="px-2.5 py-2 text-xs rounded-md border outline-none"
          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <option value="All">All Statuses</option>
          {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Asset List */}
        <div className="flex-1 min-w-0 card-elevated rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                  {['Asset Tag', 'Type', 'Model / Serial', 'Department', 'Status', 'Issued To', ''].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const sc = STATUS_CONFIG[asset.status];
                  const isSelected = selected?.id === asset.id;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => { setSelected(asset); setEditMode(false); }}
                      className="cursor-pointer transition-colors duration-100"
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--muted)' : 'var(--card)',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--secondary)'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--card)'; }}
                    >
                      <td className="px-3 py-2.5 font-mono-data text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{asset.assetTag}</td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                          {TYPE_ICONS[asset.type]}
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium" style={{ color: 'var(--foreground)' }}>{asset.model}</div>
                        <div className="font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{asset.serialNumber}</div>
                      </td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{asset.department}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${sc.className}`}>
                          {sc.icon}{sc.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{asset.issuedTo || '—'}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      No assets match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 card-elevated rounded-lg p-4 space-y-4 slide-in-right">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  {selected.assetTag}
                </div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selected.model}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {!editMode ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-white transition-all"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Save size={11} /> Save
                    </button>
                    <button
                      onClick={() => { setEditMode(false); setEditData({}); }}
                      className="p-1 rounded border transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CONFIG[selected.status].className}`}>
              {STATUS_CONFIG[selected.status].icon}
              {STATUS_CONFIG[selected.status].label}
            </span>

            <div className="space-y-2.5">
              {[
                { label: 'Type', field: 'type', value: selected.type, type: 'select', options: ASSET_TYPES },
                { label: 'Manufacturer', field: 'manufacturer', value: selected.manufacturer, type: 'text' },
                { label: 'Serial Number', field: 'serialNumber', value: selected.serialNumber, type: 'text', mono: true },
                { label: 'Department', field: 'department', value: selected.department, type: 'text' },
                { label: 'Location', field: 'location', value: selected.location, type: 'text' },
                { label: 'Status', field: 'status', value: selected.status, type: 'select', options: ASSET_STATUSES },
                { label: 'Issued To', field: 'issuedTo', value: selected.issuedTo || '', type: 'text' },
                { label: 'Issued Date', field: 'issuedDate', value: selected.issuedDate || '', type: 'date' },
                { label: 'Purchase Date', field: 'purchaseDate', value: selected.purchaseDate, type: 'date' },
                { label: 'Warranty Expiry', field: 'warrantyExpiry', value: selected.warrantyExpiry, type: 'date' },
                { label: 'Cost', field: 'costKES', value: String(selected.costKES), type: 'number' },
              ].map(({ label, field, value, type, options, mono }) => (
                <div key={field} className="flex justify-between items-start gap-2 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  {editMode ? (
                    type === 'select' ? (
                      <select
                        value={(editData as Record<string, string>)[field] ?? value}
                        onChange={e => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="text-[11px] px-1.5 py-0.5 rounded border outline-none text-right"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        {(options as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={(editData as Record<string, string>)[field] ?? value}
                        onChange={e => setEditData(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="text-[11px] px-1.5 py-0.5 rounded border outline-none text-right w-40"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    )
                  ) : (
                    <span className={`text-[11px] text-right font-medium ${mono ? 'font-mono-data' : ''}`} style={{ color: 'var(--foreground)' }}>
                      {field === 'costKES' ? formatKES(Number(value)) : (type === 'date' ? fmtDate(value) : value || '—')}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
                <textarea
                  value={(editData.notes as string) ?? selected.notes}
                  onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full text-[11px] px-2 py-1.5 rounded border outline-none resize-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            )}
            {!editMode && selected.notes && (
              <div className="rounded-md p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-lg rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Add New ICT Asset</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Asset Tag', field: 'assetTag', type: 'text' },
                { label: 'Model', field: 'model', type: 'text' },
                { label: 'Serial Number', field: 'serialNumber', type: 'text' },
                { label: 'Manufacturer', field: 'manufacturer', type: 'text' },
                { label: 'Department', field: 'department', type: 'text' },
                { label: 'Location', field: 'location', type: 'text' },
                { label: 'Issued To', field: 'issuedTo', type: 'text' },
                { label: 'Cost (KES)', field: 'costKES', type: 'number' },
                { label: 'Purchase Date', field: 'purchaseDate', type: 'date' },
                { label: 'Warranty Expiry', field: 'warrantyExpiry', type: 'date' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="text-[11px] block mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                  <input
                    type={type}
                    value={(newAsset as Record<string, string | number | null>)[field] as string ?? ''}
                    onChange={e => setNewAsset(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 rounded border outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--muted-foreground)' }}>Type</label>
                <select
                  value={newAsset.type}
                  onChange={e => setNewAsset(prev => ({ ...prev, type: e.target.value as IctAssetType }))}
                  className="w-full text-xs px-2.5 py-1.5 rounded border outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                <select
                  value={newAsset.status}
                  onChange={e => setNewAsset(prev => ({ ...prev, status: e.target.value as IctAssetStatus }))}
                  className="w-full text-xs px-2.5 py-1.5 rounded border outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
              <textarea
                value={newAsset.notes}
                onChange={e => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full text-xs px-2.5 py-1.5 rounded border outline-none resize-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
