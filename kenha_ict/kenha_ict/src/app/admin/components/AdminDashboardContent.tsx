'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2, AlertTriangle, FileKey, FileText, BarChart3 } from 'lucide-react';
import { licenses, contracts, budgetItems, type License, type Contract, type BudgetItem } from '@/lib/mockData';

type AdminTab = 'licenses' | 'contracts' | 'budget';

function formatKES(v: number) {
  if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(2)}M`;
  return `KES ${(v / 1_000).toFixed(0)}K`;
}

function fmtDate(d: string) {
  if (!d || d === '—') return d;
  try { return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; }
}

function InlineInput({ value, onChange, type = 'text', className = '' }: { value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-xs px-1.5 py-0.5 rounded border outline-none w-full ${className}`}
      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
    />
  );
}

function InlineSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs px-1.5 py-0.5 rounded border outline-none"
      style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── LICENSES ADMIN ───────────────────────────────────────────────────────────
function LicensesAdmin() {
  const [rows, setRows] = useState<License[]>(licenses);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<License>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<Partial<License>>({});

  const startEdit = (l: License) => { setEditId(l.id); setEditData({ ...l }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };
  const saveEdit = () => {
    setRows(prev => prev.map(r => r.id === editId ? { ...r, ...editData } as License : r));
    setEditId(null); setEditData({});
  };
  const deleteRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const addRow = () => {
    const id = `lic-${String(rows.length + 1).padStart(3, '0')}`;
    setRows(prev => [...prev, { id, name: '', vendor: '', category: 'Productivity', department: '', status: 'Active', expiryDate: '', annualCostKES: 0, seatsTotal: 0, seatsUsed: 0, licenseKey: '', renewalContact: '', notes: '', ...newRow } as License]);
    setShowAdd(false); setNewRow({});
  };

  const statusColors: Record<string, string> = {
    'Active': 'status-active', 'Expiring Soon': 'status-expiring', 'Expired': 'status-expired', 'Renewed': 'status-review'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{rows.length} licenses on record</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={11} /> Add License
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg p-4 space-y-3 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>New License</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { label: 'Name', field: 'name' }, { label: 'Vendor', field: 'vendor' },
              { label: 'Department', field: 'department' }, { label: 'License Key', field: 'licenseKey' },
              { label: 'Renewal Contact', field: 'renewalContact' }, { label: 'Expiry Date', field: 'expiryDate', type: 'date' },
              { label: 'Annual Cost (KES)', field: 'annualCostKES', type: 'number' }, { label: 'Seats Total', field: 'seatsTotal', type: 'number' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                <InlineInput value={String((newRow as Record<string, string | number>)[field] ?? '')} onChange={v => setNewRow(p => ({ ...p, [field]: type === 'number' ? Number(v) : v }))} type={type} />
              </div>
            ))}
            <div>
              <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Category</label>
              <InlineSelect value={newRow.category ?? 'Productivity'} onChange={v => setNewRow(p => ({ ...p, category: v as License['category'] }))} options={['Security', 'Productivity', 'Infrastructure', 'Development', 'Connectivity', 'ERP']} />
            </div>
            <div>
              <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Status</label>
              <InlineSelect value={newRow.status ?? 'Active'} onChange={v => setNewRow(p => ({ ...p, status: v as License['status'] }))} options={['Active', 'Expiring Soon', 'Expired', 'Renewed']} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRow} className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>Add</button>
            <button onClick={() => { setShowAdd(false); setNewRow({}); }} className="px-3 py-1 rounded text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                {['Name', 'Vendor', 'Category', 'Department', 'Status', 'Expiry', 'Annual Cost', 'Seats', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isEdit = editId === row.id;
                const d = isEdit ? editData : row;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: isEdit ? 'var(--muted)' : 'var(--card)' }}>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.name ?? ''} onChange={v => setEditData(p => ({ ...p, name: v }))} /> : <span className="font-medium" style={{ color: 'var(--foreground)' }}>{row.name}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.vendor ?? ''} onChange={v => setEditData(p => ({ ...p, vendor: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.vendor}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineSelect value={d.category ?? 'Productivity'} onChange={v => setEditData(p => ({ ...p, category: v as License['category'] }))} options={['Security', 'Productivity', 'Infrastructure', 'Development', 'Connectivity', 'ERP']} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.category}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.department ?? ''} onChange={v => setEditData(p => ({ ...p, department: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.department}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineSelect value={d.status ?? 'Active'} onChange={v => setEditData(p => ({ ...p, status: v as License['status'] }))} options={['Active', 'Expiring Soon', 'Expired', 'Renewed']} /> : (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[row.status] ?? ''}`}>{row.status}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={d.expiryDate ?? ''} onChange={v => setEditData(p => ({ ...p, expiryDate: v }))} type="date" /> : <span style={{ color: 'var(--muted-foreground)' }}>{fmtDate(row.expiryDate)}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={String(d.annualCostKES ?? 0)} onChange={v => setEditData(p => ({ ...p, annualCostKES: Number(v) }))} type="number" /> : <span style={{ color: 'var(--foreground)' }}>{formatKES(row.annualCostKES)}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={String(d.seatsTotal ?? 0)} onChange={v => setEditData(p => ({ ...p, seatsTotal: Number(v) }))} type="number" className="w-16" /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.seatsUsed}/{row.seatsTotal}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {isEdit ? (
                          <>
                            <button onClick={saveEdit} className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"><Save size={12} /></button>
                            <button onClick={cancelEdit} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--muted-foreground)' }}><X size={12} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"><Edit2 size={12} /></button>
                            <button onClick={() => deleteRow(row.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    </td>
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

// ─── CONTRACTS ADMIN ──────────────────────────────────────────────────────────
function ContractsAdmin() {
  const [rows, setRows] = useState<Contract[]>(contracts);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Contract>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<Partial<Contract>>({});

  const startEdit = (c: Contract) => { setEditId(c.id); setEditData({ ...c }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };
  const saveEdit = () => {
    setRows(prev => prev.map(r => r.id === editId ? { ...r, ...editData } as Contract : r));
    setEditId(null); setEditData({});
  };
  const deleteRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const addRow = () => {
    const id = `con-${String(rows.length + 1).padStart(3, '0')}`;
    setRows(prev => [...prev, { id, refNumber: '', name: '', supplierId: '', supplierName: '', valueKES: 0, startDate: '', endDate: '', slaTier: 'Silver', status: 'Active', department: '', description: '', milestones: [], ...newRow } as Contract]);
    setShowAdd(false); setNewRow({});
  };

  const statusColors: Record<string, string> = {
    'Active': 'status-active', 'Expiring': 'status-expiring', 'Expired': 'status-expired', 'Under Review': 'status-review', 'Terminated': 'status-terminated'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{rows.length} contracts on record</p>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={11} /> Add Contract
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg p-4 space-y-3 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>New Contract</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { label: 'Ref Number', field: 'refNumber' }, { label: 'Contract Name', field: 'name' },
              { label: 'Supplier Name', field: 'supplierName' }, { label: 'Department', field: 'department' },
              { label: 'Value (KES)', field: 'valueKES', type: 'number' }, { label: 'Start Date', field: 'startDate', type: 'date' },
              { label: 'End Date', field: 'endDate', type: 'date' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                <InlineInput value={String((newRow as Record<string, string | number>)[field] ?? '')} onChange={v => setNewRow(p => ({ ...p, [field]: type === 'number' ? Number(v) : v }))} type={type} />
              </div>
            ))}
            <div>
              <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>SLA Tier</label>
              <InlineSelect value={newRow.slaTier ?? 'Silver'} onChange={v => setNewRow(p => ({ ...p, slaTier: v as Contract['slaTier'] }))} options={['Platinum', 'Gold', 'Silver', 'Bronze']} />
            </div>
            <div>
              <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Status</label>
              <InlineSelect value={newRow.status ?? 'Active'} onChange={v => setNewRow(p => ({ ...p, status: v as Contract['status'] }))} options={['Active', 'Under Review', 'Expiring', 'Expired', 'Terminated']} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRow} className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>Add</button>
            <button onClick={() => { setShowAdd(false); setNewRow({}); }} className="px-3 py-1 rounded text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                {['Ref', 'Contract Name', 'Supplier', 'Department', 'Status', 'SLA', 'Value', 'End Date', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isEdit = editId === row.id;
                const d = isEdit ? editData : row;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: isEdit ? 'var(--muted)' : 'var(--card)' }}>
                    <td className="px-3 py-2 font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                      {isEdit ? <InlineInput value={d.refNumber ?? ''} onChange={v => setEditData(p => ({ ...p, refNumber: v }))} /> : row.refNumber}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.name ?? ''} onChange={v => setEditData(p => ({ ...p, name: v }))} /> : <span className="font-medium" style={{ color: 'var(--foreground)' }}>{row.name}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.supplierName ?? ''} onChange={v => setEditData(p => ({ ...p, supplierName: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.supplierName}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.department ?? ''} onChange={v => setEditData(p => ({ ...p, department: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.department}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineSelect value={d.status ?? 'Active'} onChange={v => setEditData(p => ({ ...p, status: v as Contract['status'] }))} options={['Active', 'Under Review', 'Expiring', 'Expired', 'Terminated']} /> : (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[row.status] ?? ''}`}>{row.status}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineSelect value={d.slaTier ?? 'Silver'} onChange={v => setEditData(p => ({ ...p, slaTier: v as Contract['slaTier'] }))} options={['Platinum', 'Gold', 'Silver', 'Bronze']} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.slaTier}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={String(d.valueKES ?? 0)} onChange={v => setEditData(p => ({ ...p, valueKES: Number(v) }))} type="number" /> : <span style={{ color: 'var(--foreground)' }}>{formatKES(row.valueKES)}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={d.endDate ?? ''} onChange={v => setEditData(p => ({ ...p, endDate: v }))} type="date" /> : <span style={{ color: 'var(--muted-foreground)' }}>{fmtDate(row.endDate)}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {isEdit ? (
                          <>
                            <button onClick={saveEdit} className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"><Save size={12} /></button>
                            <button onClick={cancelEdit} className="p-1 rounded" style={{ color: 'var(--muted-foreground)' }}><X size={12} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit2 size={12} /></button>
                            <button onClick={() => deleteRow(row.id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    </td>
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

// ─── BUDGET ADMIN ─────────────────────────────────────────────────────────────
function BudgetAdmin() {
  const [rows, setRows] = useState<BudgetItem[]>(budgetItems);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BudgetItem>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<Partial<BudgetItem>>({});

  const startEdit = (b: BudgetItem) => { setEditId(b.id); setEditData({ ...b }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };
  const saveEdit = () => {
    setRows(prev => prev.map(r => r.id === editId ? { ...r, ...editData } as BudgetItem : r));
    setEditId(null); setEditData({});
  };
  const deleteRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id));
  const addRow = () => {
    const id = `bud-${String(rows.length + 1).padStart(3, '0')}`;
    setRows(prev => [...prev, { id, description: '', category: 'Software', department: '', allocatedKES: 0, consumedKES: 0, invoiceRef: '—', date: '—', ...newRow } as BudgetItem]);
    setShowAdd(false); setNewRow({});
  };

  const totalAllocated = rows.reduce((s, r) => s + r.allocatedKES, 0);
  const totalConsumed = rows.reduce((s, r) => s + r.consumedKES, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Total Allocated</p>
            <p className="text-sm font-semibold font-mono-data" style={{ color: 'var(--foreground)' }}>{formatKES(totalAllocated)}</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Total Consumed</p>
            <p className="text-sm font-semibold font-mono-data text-blue-600 dark:text-blue-400">{formatKES(totalConsumed)}</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Utilization</p>
            <p className="text-sm font-semibold font-mono-data text-green-700 dark:text-green-400">{Math.round((totalConsumed / totalAllocated) * 100)}%</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={11} /> Add Item
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg p-4 space-y-3 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>New Budget Item</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { label: 'Description', field: 'description' }, { label: 'Department', field: 'department' },
              { label: 'Invoice Ref', field: 'invoiceRef' }, { label: 'Date', field: 'date', type: 'date' },
              { label: 'Allocated (KES)', field: 'allocatedKES', type: 'number' }, { label: 'Consumed (KES)', field: 'consumedKES', type: 'number' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                <InlineInput value={String((newRow as Record<string, string | number>)[field] ?? '')} onChange={v => setNewRow(p => ({ ...p, [field]: type === 'number' ? Number(v) : v }))} type={type} />
              </div>
            ))}
            <div>
              <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Category</label>
              <InlineSelect value={newRow.category ?? 'Software'} onChange={v => setNewRow(p => ({ ...p, category: v as BudgetItem['category'] }))} options={['Software', 'Hardware', 'Connectivity', 'Services', 'Security']} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRow} className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: 'var(--primary)' }}>Add</button>
            <button onClick={() => { setShowAdd(false); setNewRow({}); }} className="px-3 py-1 rounded text-xs border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card-elevated rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                {['Description', 'Category', 'Department', 'Allocated', 'Consumed', 'Utilization', 'Invoice Ref', 'Date', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isEdit = editId === row.id;
                const d = isEdit ? editData : row;
                const pct = row.allocatedKES > 0 ? Math.round((row.consumedKES / row.allocatedKES) * 100) : 0;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: isEdit ? 'var(--muted)' : 'var(--card)' }}>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.description ?? ''} onChange={v => setEditData(p => ({ ...p, description: v }))} /> : <span className="font-medium" style={{ color: 'var(--foreground)' }}>{row.description}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineSelect value={d.category ?? 'Software'} onChange={v => setEditData(p => ({ ...p, category: v as BudgetItem['category'] }))} options={['Software', 'Hardware', 'Connectivity', 'Services', 'Security']} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.category}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEdit ? <InlineInput value={d.department ?? ''} onChange={v => setEditData(p => ({ ...p, department: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.department}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={String(d.allocatedKES ?? 0)} onChange={v => setEditData(p => ({ ...p, allocatedKES: Number(v) }))} type="number" /> : <span style={{ color: 'var(--foreground)' }}>{formatKES(row.allocatedKES)}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={String(d.consumedKES ?? 0)} onChange={v => setEditData(p => ({ ...p, consumedKES: Number(v) }))} type="number" /> : <span style={{ color: 'var(--foreground)' }}>{formatKES(row.consumedKES)}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--positive)' }} />
                        </div>
                        <span className="font-mono-data text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[10px]">
                      {isEdit ? <InlineInput value={d.invoiceRef ?? ''} onChange={v => setEditData(p => ({ ...p, invoiceRef: v }))} /> : <span style={{ color: 'var(--muted-foreground)' }}>{row.invoiceRef}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono-data text-[11px]">
                      {isEdit ? <InlineInput value={d.date ?? ''} onChange={v => setEditData(p => ({ ...p, date: v }))} type="date" /> : <span style={{ color: 'var(--muted-foreground)' }}>{fmtDate(row.date)}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {isEdit ? (
                          <>
                            <button onClick={saveEdit} className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"><Save size={12} /></button>
                            <button onClick={cancelEdit} className="p-1 rounded" style={{ color: 'var(--muted-foreground)' }}><X size={12} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(row)} className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit2 size={12} /></button>
                            <button onClick={() => deleteRow(row.id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    </td>
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

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboardContent() {
  const [tab, setTab] = useState<AdminTab>('licenses');

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'licenses', label: 'Licenses', icon: <FileKey size={14} /> },
    { key: 'contracts', label: 'Contracts', icon: <FileText size={14} /> },
    { key: 'budget', label: 'Budget Items', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Administration</p>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Edit licenses, contracts, and budget data inline — changes are reflected across the system
        </p>
      </div>

      {/* Alert Banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'rgba(180,83,9,0.2)' }}>
        <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
        <p className="text-xs" style={{ color: 'var(--warning)' }}>
          <strong>Admin mode:</strong> All edits are applied immediately. Click the edit icon on any row to modify data, then save to confirm changes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
              tab === t.key ? 'shadow-sm' : ''
            }`}
            style={tab === t.key
              ? { backgroundColor: 'var(--card)', color: 'var(--foreground)' }
              : { color: 'var(--muted-foreground)' }
            }
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'licenses' && <LicensesAdmin />}
      {tab === 'contracts' && <ContractsAdmin />}
      {tab === 'budget' && <BudgetAdmin />}
    </div>
  );
}
