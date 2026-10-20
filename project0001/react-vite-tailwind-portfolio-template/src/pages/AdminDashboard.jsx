import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Users, BarChart3, Send, Loader2, Check,
    AlertCircle, ChevronDown, LayoutDashboard, Calendar,
    Briefcase, Sprout, FileText, Settings, LogOut,
    MessageSquare, Search, Plus, Filter, MoreVertical,
    Download, ExternalLink, Trash2, Edit3, Shield, Box
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/Slice/AuthSlice';
import ServiceModal from '../components/Admin/ServiceModal';
import CropModal from '../components/Admin/CropModal';
import PostModal from '../components/Admin/PostModal';
import ProjectModal from '../components/Admin/ProjectModal';
import BookingModal from '../components/Admin/BookingModal';
import AdminMembership from '../components/Admin/AdminMembership';
import AdminPartners from '../components/Admin/AdminPartners';
import AdminMarket from '../components/Admin/AdminMarket';
import {
    useGetDashboardStatsQuery,
    useGetAllUsersQuery,
    useGetAllBookingsQuery,
    useGetSettingsQuery,
    useDeleteServiceMutation,
    useDeleteCropMutation,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useDeleteTipMutation,
    useDeleteProjectMutation,
    useUpdateSettingsMutation,
    useLazyExportDataQuery,
    useApproveTestimonialMutation,
    useDeleteTestimonialMutation,
} from '../features/Api/adminApi';
import { useSendNotificationMutation } from '../features/Api/notificationsApi';
import { useGetServicesQuery } from '../features/Api/servicesApi';
import {
    useGetPublicCropsQuery,
    useGetPublicTipsQuery,
    useGetPublicProjectsQuery,
    useGetPublicTestimonialsQuery
} from '../features/Api/publicApi';
import { exportBookingsToCSV, exportUsersToCSV, exportServicesToCSV } from '../utils/csvExport';

const AdminDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin dashboard.</p>
            </div>
        );
    }

    const navigation = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'bookings', name: 'Bookings', icon: Calendar },
        { id: 'memberships', name: 'Memberships', icon: Shield },
        { id: 'partners', name: 'Partners', icon: Briefcase },
        { id: 'market', name: 'Market Requests', icon: Box },
        { id: 'services', name: 'Services', icon: Briefcase },
        { id: 'users', name: 'User Management', icon: Users },
        { id: 'crops', name: 'Crops Database', icon: Sprout },
        { id: 'blog', name: 'Blog & Tips', icon: FileText },
        { id: 'projects', name: 'Our Projects', icon: Briefcase },
        { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
        { id: 'settings', name: 'System Settings', icon: Settings },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab stats={statsData?.stats} loading={statsLoading} />;
            case 'bookings': return <BookingsTab />;
            case 'memberships': return <AdminMembership />;
            case 'partners': return <AdminPartners />;
            case 'market': return <AdminMarket />;
            case 'services': return <ServicesTab />;
            case 'users': return <UsersTab />;
            case 'crops': return <CropsTab />;
            case 'blog': return <BlogTab />;
            case 'projects': return <ProjectsTab />;
            case 'testimonials': return <TestimonialsTab />;
            case 'settings': return <SettingsTab />;
            default: return <OverviewTab stats={statsData?.stats} loading={statsLoading} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col h-screen
            `}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-green-600" />
                        Admin Panel
                    </h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Plus className="w-5 h-5 rotate-45" />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <Filter className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate max-w-[150px] sm:max-w-none">
                                {activeTab.replace('_', ' ')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                            </button>
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold border border-green-200 dark:border-green-800">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 lg:p-6 p-4">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

/* --- Sub-components (to be moved to separate files later) --- */

const OverviewTab = ({ stats, loading }) => {
    const overview = stats?.overview || {};

    const cards = [
        { name: 'Total Revenue', value: `KES ${overview.total_revenue?.toLocaleString() || 0}`, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
        { name: 'Total Bookings', value: overview.total_bookings || 0, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { name: 'Active Users', value: overview.total_users || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        { name: 'Conversion', value: `${overview.conversion_rate || 0}%`, icon: Check, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    ];

    // Fetch all data for export
    const { data: bookingsData } = useGetAllBookingsQuery({});
    const { data: usersData } = useGetAllUsersQuery({});
    const { data: servicesData } = useGetServicesQuery();

    const [isExporting, setIsExporting] = useState(false);

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
    </div>;

    const handleExportAll = async () => {
        setIsExporting(true);
        try {
            const timestamp = new Date().toISOString().split('T')[0];

            // Export bookings
            if (bookingsData?.bookings && bookingsData.bookings.length > 0) {
                exportBookingsToCSV(bookingsData.bookings, `all_bookings_${timestamp}.csv`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
            }

            // Export users
            if (usersData?.users && usersData.users.length > 0) {
                exportUsersToCSV(usersData.users, `all_users_${timestamp}.csv`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Export services
            if (servicesData?.services && servicesData.services.length > 0) {
                exportServicesToCSV(servicesData.services, `all_services_${timestamp}.csv`);
            }

            // Show success message
            setTimeout(() => {
                alert('All data exported successfully! Check your downloads folder for 3 CSV files.');
            }, 1000);

        } catch (err) {
            console.error('Export error:', err);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                <button
                    onClick={handleExportAll}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Exporting...' : 'Export All Data (CSV)'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-2">
                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.name}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                        {stats?.recent_bookings?.map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                                        {booking.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{booking.user?.name}</p>
                                        <p className="text-xs text-gray-500">{booking.service?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {booking.status}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(booking.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Notifications</h3>
                    <SendNotificationForm />
                </div>
            </div>
        </div >
    );
};

const SendNotificationForm = () => {
    const { data: usersData } = useGetAllUsersQuery({});
    const [sendNotification, { isLoading: sending }] = useSendNotificationMutation();
    const [form, setForm] = useState({ user_id: '', type: 'info', message: '' });
    const [status, setStatus] = useState(null);
    const [isBroadcast, setIsBroadcast] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        try {
            if (isBroadcast) {
                // Send to all users
                const users = usersData?.users || [];
                if (users.length === 0) {
                    setStatus({ success: false, message: 'No users found' });
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                for (const user of users) {
                    try {
                        await sendNotification({
                            user_id: user.id,
                            type: form.type,
                            message: form.message
                        }).unwrap();
                        successCount++;
                    } catch (err) {
                        console.error(`Failed to send to user ${user.id}:`, err);
                        failCount++;
                    }
                }

                setStatus({
                    success: true,
                    message: `Broadcast sent to ${successCount} users${failCount > 0 ? ` (${failCount} failed)` : ''}`
                });
            } else {
                // Send to single user
                if (!form.user_id) {
                    setStatus({ success: false, message: 'Please select a user' });
                    return;
                }

                await sendNotification({
                    user_id: form.user_id,
                    type: form.type,
                    message: form.message
                }).unwrap();

                setStatus({ success: true, message: 'Notification sent!' });
            }

            setForm({ user_id: '', type: 'info', message: '' });
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            console.error('Send notification error:', err);
            const errorMsg = err?.data?.error || err?.message || 'Failed to send notification';
            setStatus({ success: false, message: errorMsg });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Broadcast Toggle */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <input
                    type="checkbox"
                    id="broadcast"
                    checked={isBroadcast}
                    onChange={(e) => {
                        setIsBroadcast(e.target.checked);
                        if (e.target.checked) {
                            setForm({ ...form, user_id: '' });
                        }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="broadcast" className="text-sm font-bold text-blue-900 dark:text-blue-100 cursor-pointer">
                    Send to all users (Broadcast)
                </label>
            </div>

            {/* User Selection - Only show if not broadcasting */}
            {!isBroadcast && (
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Recipient</label>
                    <select
                        value={form.user_id}
                        onChange={e => setForm({ ...form, user_id: e.target.value })}
                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 p-3 text-sm"
                        required={!isBroadcast}
                    >
                        <option value="">Select Target User</option>
                        {usersData?.users?.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Notification Type */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Type</label>
                <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 p-3 text-sm"
                >
                    <option value="info">Info</option>
                    <option value="booking_confirmation">Booking Confirmation</option>
                    <option value="reminder">Reminder</option>
                    <option value="payment_receipt">Payment Receipt</option>
                </select>
            </div>

            {/* Message */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Message</label>
                <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 p-3 text-sm h-24 resize-none"
                    placeholder="Type your message here..."
                    required
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={sending}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : (isBroadcast ? 'Send Broadcast' : 'Send Notification')}
            </button>

            {/* Status Message */}
            {status && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {status.message}
                </div>
            )}
        </form>
    );
};

const BookingsTab = () => {
    const { data: bookingsData, isLoading } = useGetAllBookingsQuery({});
    const bookings = bookingsData?.bookings || [];

    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking? This will notify the user.')) {
            // Cancellation logic
            alert('Cancellation logic for booking ' + id);
        }
    };

    const handleExportCSV = () => {
        if (bookings && bookings.length > 0) {
            exportBookingsToCSV(bookings);
        } else {
            alert('No bookings to export');
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search bookings..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {bookings.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium capitalize">
                                        {b.user?.name}
                                        <p className="text-[10px] text-gray-400 font-normal lowercase">{b.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">{b.service?.name}</td>
                                    <td className="px-6 py-4">
                                        <p>{new Date(b.date).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-400">{b.start_time} - {b.end_time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                            b.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                b.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                                                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {b.payments?.[0] ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold">KES {b.payments[0].amount}</span>
                                                <span className="text-gray-400 capitalize">{b.payments[0].status}</span>
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(b)}
                                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-blue-600"
                                                title="Edit Booking"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCancel(b.id)}
                                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-red-600"
                                                title="Cancel Booking"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {b.meeting_link && (
                                                <a
                                                    href={b.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-green-600"
                                                    title="Join Meeting"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BookingModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />
        </>
    );
};

const ServicesTab = () => {
    const { data: servicesData, isLoading } = useGetServicesQuery();
    const [deleteService] = useDeleteServiceMutation();
    const services = servicesData?.services || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const handleEdit = (service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id).unwrap();
            } catch (err) {
                alert('Failed to delete service: ' + (err.data?.error || 'Unknown error'));
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleExportCSV = () => {
        if (services && services.length > 0) {
            exportServicesToCSV(services);
        } else {
            alert('No services to export');
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search services..." className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Service
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Service Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Crops</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {services.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{s.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{s.description}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-600">KES {s.price}</td>
                                    <td className="px-6 py-4">{s.duration_mins || s.duration} mins</td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {s.service_crops?.slice(0, 3).map((c, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-green-100 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-green-700" title={c.name}>
                                                    {c.name.charAt(0)}
                                                </div>
                                            ))}
                                            {s.service_crops?.length > 3 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    +{s.service_crops.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-blue-600"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ServiceModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        serviceToEdit={editingService}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const UsersTab = () => {
    const { data: usersData, isLoading } = useGetAllUsersQuery({});
    const [updateRole] = useUpdateUserRoleMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const users = usersData?.users?.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await updateRole({ id, role: newRole }).unwrap();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete user "${name}"? This cannot be undone.`)) {
            try {
                await deleteUser(id).unwrap();
            } catch (err) {
                alert(err?.data?.error || 'Failed to delete user');
            }
        }
    };

    const handleExportCSV = () => {
        if (users && users.length > 0) {
            exportUsersToCSV(users);
        } else {
            alert('No users to export');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg"
                    />
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-700 uppercase">
                                        {u.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white capitalize">{u.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900 dark:text-white">{u.email}</p>
                                    <p className="text-xs text-gray-400">{u.phone || 'No phone'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border-none focus:ring-0 cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                        disabled={isDeleting || u.role === 'admin'} // Prevent deleting admins easily or allow it but warn
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CropsTab = () => {
    const { data: cropsData } = useGetPublicCropsQuery({});
    const [deleteCrop] = useDeleteCropMutation();
    const crops = cropsData?.crops || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    const handleEdit = (crop) => {
        setEditingCrop(crop);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this crop?')) {
            try {
                await deleteCrop(id).unwrap();
            } catch (err) {
                alert('Failed to delete crop');
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingCrop(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <input type="text" placeholder="Search crops..." className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg w-64" />
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Crop
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Crop</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Season</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {crops.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                            <Sprout className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white capitalize">{c.name}</p>
                                            <p className="text-[10px] text-gray-400 capitalize">{c.category}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 italic text-gray-500 capitalize">{c.scientific_name || 'N/A'}</td>
                                    <td className="px-6 py-4 font-medium">{c.growing_season}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CropModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cropToEdit={editingCrop}
            />
        </>
    );
};

const BlogTab = () => {
    const { data: tipsData } = useGetPublicTipsQuery({});
    const [deleteTip] = useDeleteTipMutation();
    const tips = tipsData?.tips || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteTip(id).unwrap();
            } catch (err) {
                alert('Failed to delete post');
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white">Blog & Expert Tips</h3>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4" /> New Post
                    </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {tips.map(t => (
                        <div key={t.id} className="p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-shadow">
                            <div className="flex gap-4">
                                <div className="w-24 h-16 rounded-lg bg-green-50 dark:bg-green-900/30 flex-shrink-0 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-600 opacity-20" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t.title}</h4>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Published: {new Date(t.published_at).toLocaleDateString()}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(t)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Edit Post"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete Post"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tips.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No posts found. Start by creating your first tip!
                        </div>
                    )}
                </div>
            </div>

            <PostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                postToEdit={editingPost}
            />
        </>
    );
};

const ProjectsTab = () => {
    const { data: projectsData } = useGetPublicProjectsQuery({});
    const [deleteProject] = useDeleteProjectMutation();
    const projects = projectsData?.projects || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(id).unwrap();
            } catch (err) {
                alert('Failed to delete project');
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white">Our Projects</h3>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {projects.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white capitalize">{p.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            p.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'} -
                                        {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Present'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectToEdit={editingProject}
            />
        </>
    );
};

const TestimonialsTab = () => {
    const { data: testimonialsData } = useGetPublicTestimonialsQuery({});
    const [approveRecord] = useApproveTestimonialMutation();
    const [deleteRecord] = useDeleteTestimonialMutation();
    const testimonials = testimonialsData?.testimonials || [];

    const handleApprove = async (id) => {
        try {
            await approveRecord(id).unwrap();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this testimonial?')) {
            try {
                await deleteRecord(id).unwrap();
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30">
                <h3 className="font-bold text-gray-900 dark:text-white">Client Testimonials</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {testimonials.map(t => (
                    <div key={t.id} className="p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-shadow">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 uppercase">
                                {t.author?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white capitalize">{t.author?.name || 'Anonymous'}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">"{t.content}"</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {t.status !== 'approved' && (
                                <button
                                    onClick={() => handleApprove(t.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsTab = () => {
    const { data: settingsData } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const [form, setForm] = useState({ platform_name: '', currency: '' });
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (settingsData?.settings) {
            setForm({
                platform_name: settingsData.settings.platform?.name || '',
                currency: settingsData.settings.platform?.currency || 'KES'
            });
        }
    }, [settingsData]);

    const handleSave = async () => {
        try {
            await updateSettings(form).unwrap();
            setStatus({ success: true, message: 'Settings saved!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ success: false, message: 'Save failed' });
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Settings className="w-5 h-5 text-gray-400" /> Platform Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Platform Name</label>
                        <input
                            type="text"
                            value={form.platform_name}
                            onChange={e => setForm({ ...form, platform_name: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 font-medium text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Currency</label>
                        <input
                            type="text"
                            value={form.currency}
                            onChange={e => setForm({ ...form, currency: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 font-medium text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                {status && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${status.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="mt-8 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Experimental Features</h3>
                <p className="text-sm text-gray-500 mb-6">Activate new features currently in testing. Use with caution.</p>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-not-allowed opacity-60">
                        <span className="font-bold">WhatsApp Reminders</span>
                        <div className="w-10 h-5 bg-gray-300 rounded-full relative" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
