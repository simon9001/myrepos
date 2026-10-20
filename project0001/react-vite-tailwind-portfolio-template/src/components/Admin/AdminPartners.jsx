import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    Briefcase,
    ExternalLink
} from 'lucide-react';
import { useGetAllSponsorApplicationsQuery, useReviewSponsorApplicationMutation } from '../../features/Api/newSystemsApi';

const AdminPartners = () => {
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: applicationsData, isLoading } = useGetAllSponsorApplicationsQuery(statusFilter);

    const [reviewApplication, { isLoading: isUpdating }] = useReviewSponsorApplicationMutation();

    const applications = applicationsData?.applications?.filter(a =>
        a.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleReview = async (id, newStatus) => {
        const action = newStatus === 'approved' ? 'approve' : 'reject';
        if (window.confirm(`Are you sure you want to ${action} this sponsor application?`)) {
            try {
                await reviewApplication({
                    id,
                    status: newStatus,
                    admin_notes: `${action.charAt(0).toUpperCase() + action.slice(1)}d by admin`
                }).unwrap();
            } catch (err) {
                alert(`Failed to ${action} application`);
            }
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sponsor applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 border-none"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {applications.length > 0 ? (
                            applications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{app.company_name}</p>
                                                <p className="text-xs text-gray-400">ID: {app.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-900 dark:text-white text-sm">{app.contact_email}</p>
                                        <p className="text-xs text-gray-500">{app.phone || 'No phone'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                            {app.product_category || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    app.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-500'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {app.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleReview(app.id, 'approved')}
                                                    disabled={isUpdating}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {app.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleReview(app.id, 'rejected')}
                                                    disabled={isUpdating}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No sponsor applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPartners;
