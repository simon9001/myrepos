import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Shield,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { useGetMembershipsQuery } from '../../features/Api/newSystemsApi';

const AdminMembership = () => {
    const [tierFilter, setTierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading } = useGetMembershipsQuery({
        tier: tierFilter,
        status: statusFilter
    });

    const memberships = data?.memberships?.filter(m =>
        m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 border-none"
                    >
                        <option value="">All Tiers</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 border-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Tier</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Expiry</th>
                            <th className="px-6 py-4">Transaction</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {memberships.length > 0 ? (
                            memberships.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                                                {m.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white capitalize">{m.user?.name}</p>
                                                <p className="text-xs text-gray-400">{m.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {m.tier === 'premium' ? <Shield className="w-4 h-4 text-amber-500" /> : <div className="w-4" />}
                                            <span className={`capitalize ${m.tier === 'premium' ? 'font-bold text-amber-600' : 'text-gray-500'}`}>
                                                {m.tier}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${m.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                            m.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {m.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {m.transaction_reference || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No memberships found matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMembership;
