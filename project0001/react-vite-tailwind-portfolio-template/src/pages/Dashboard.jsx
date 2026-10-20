import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Bell,
    CheckCircle,
    AlertCircle,
    Video,
    CreditCard,
    User,
    LogOut,
    ChevronRight,
    ExternalLink,
    Loader2,
    RefreshCw,
    MoreVertical,
    ShoppingBag,
    Briefcase,
    TrendingUp,
    Users,
    ShieldCheck
} from 'lucide-react';
import { selectCurrentUser } from '../features/Slice/AuthSlice';
import { useGetMyBookingsQuery } from '../features/Api/bookingsApi';
import {
    useGetUserNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation
} from '../features/Api/notificationsApi';
import { useGetMembershipStatusQuery, useUpgradeMembershipMutation } from '../features/Api/newSystemsApi';

// New Systems Components
import MembershipSection from '../components/Dashboard/MembershipSection';
import NetworkSection from '../components/Dashboard/NetworkSection';
import MarketSection from '../components/Dashboard/MarketSection';
import ProductsSection from '../components/Dashboard/ProductsSection';
import PurchasesSection from '../components/Dashboard/PurchasesSection';

const Dashboard = () => {
    const user = useSelector(selectCurrentUser);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const {
        data: bookingsData,
        isLoading: isBookingsLoading,
        isFetching: isBookingsFetching,
        refetch: refetchBookings
    } = useGetMyBookingsQuery();

    const {
        data: notificationsData,
        isLoading: isNotificationsLoading,
        refetch: refetchNotifications
    } = useGetUserNotificationsQuery();

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    const bookings = bookingsData?.bookings || [];
    const notifications = notificationsData?.notifications || [];
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">{user?.name || 'Farmer'}</span>!
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your consultations and stay updated on your farm growth.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-border/50 shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="block">
                            <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[120px] sm:max-w-none">{user?.email}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 bg-white/50 dark:bg-gray-900/50 p-1 rounded-xl border border-border/50 w-full md:w-fit backdrop-blur-sm overflow-x-auto no-scrollbar scroll-smooth">
                    {/* Common Tabs */}
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                            ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Overview
                    </button>

                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'bookings'
                            ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Bookings
                        {bookings.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                {bookings.length}
                            </span>
                        )}
                    </button>

                    {/* Role Specific Tabs */}
                    {user?.role === 'farmer' && (
                        <>
                            <button
                                onClick={() => setActiveTab('network')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'network'
                                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Network
                            </button>
                            <button
                                onClick={() => setActiveTab('market')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'market'
                                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Market
                            </button>
                            <button
                                onClick={() => setActiveTab('membership')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'membership'
                                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Membership
                            </button>
                        </>
                    )}

                    {user?.role === 'sponsor' && (
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'products'
                                ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            My Sponsorships
                        </button>
                    )}

                    {user?.role === 'buyer' && (
                        <>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'requests'
                                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                My Requests
                            </button>
                            <button
                                onClick={() => setActiveTab('purchases')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'purchases'
                                    ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                My Purchases
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative ${activeTab === 'notifications'
                            ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Bell className="w-4 h-4" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 text-[10px] text-white items-center justify-center font-bold">
                                    {unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-border/50 text-center">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to your Dashboard</h2>
                                <p className="text-muted-foreground mb-6">Select a tab above to manage your activities.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20">
                                        <h3 className="font-bold text-green-700 dark:text-green-400">Bookings</h3>
                                        <p className="text-xs text-green-600/80 mt-1">Manage your consultations.</p>
                                    </div>
                                    {user?.role === 'farmer' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                            <h3 className="font-bold text-amber-700 dark:text-amber-400">Farmer Network</h3>
                                            <p className="text-xs text-amber-600/80 mt-1">Connect with peers (Premium).</p>
                                        </div>
                                    )}
                                    {user?.role === 'sponsor' && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                            <h3 className="font-bold text-blue-700 dark:text-blue-400">My Sponsorships</h3>
                                            <p className="text-xs text-blue-600/80 mt-1">Manage your inventory and presence.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground">My Consultations</h2>
                                <button
                                    onClick={() => refetchBookings()}
                                    className="p-2 text-muted-foreground hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-5 h-5 ${(isBookingsLoading || isBookingsFetching) ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {isBookingsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-48 rounded-2xl bg-white dark:bg-gray-900 animate-pulse border border-border/50"></div>
                                    ))}
                                </div>
                            ) : bookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bookings.map((booking) => (
                                        <motion.div
                                            key={booking.id}
                                            layout
                                            className="group bg-white dark:bg-gray-900 rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-green-100/10 dark:hover:shadow-green-950/10 transition-all duration-300 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center text-green-600">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground group-hover:text-green-600 transition-colors">
                                                        {booking.service?.name || 'Consultation'}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {booking.service?.duration_mins} mins • Ksh {booking.service?.price}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center justify-between text-sm py-2 border-y border-border/50">
                                                    <span className="text-muted-foreground">Date</span>
                                                    <span className="font-medium text-foreground">
                                                        {new Date(booking.date).toLocaleDateString('en-KE', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Time Slot</span>
                                                    <span className="font-medium text-foreground">{booking.start_time} - {booking.end_time}</span>
                                                </div>
                                            </div>

                                            {booking.meeting_link ? (
                                                <a
                                                    href={booking.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-200 dark:shadow-green-950 transition-all"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Join Meeting
                                                </a>
                                            ) : booking.status === 'confirmed' || booking.status === 'paid' ? (
                                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                                                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">Link will be shared before the session</p>
                                                </div>
                                            ) : booking.status === 'pending' ? (
                                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800 text-center">
                                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Complete payment to confirm</p>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-border/50 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">No bookings yet</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">Start your farming journey by booking a professional consultation today.</p>
                                    <a href="/booking" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-200/50 dark:shadow-green-950">
                                        Book Now
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground">Updates & Notices</h2>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsRead()}
                                            className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => refetchNotifications()}
                                        className="p-2 text-muted-foreground hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${isNotificationsLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {isNotificationsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 rounded-2xl bg-white dark:bg-gray-900 animate-pulse border border-border/50"></div>
                                    ))}
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            className={`group flex gap-4 p-5 rounded-3xl border transition-all duration-300 ${notif.is_read
                                                ? 'bg-white/40 dark:bg-gray-900/40 border-border/50 opacity-80'
                                                : 'bg-white dark:bg-gray-900 border-green-100 dark:border-green-900/30 shadow-sm'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${notif.type === 'booking_confirmation'
                                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                                }`}>
                                                {notif.type === 'booking_confirmation' ? <CheckCircle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                                                        {notif.message}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="flex-shrink-0 text-[10px] font-bold text-green-600 uppercase tracking-tighter hover:underline"
                                                        >
                                                            Done
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                                    {new Date(notif.created_at).toLocaleString('en-KE', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 border border-border/50 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                                        <Bell className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">All caught up!</h3>
                                    <p className="text-sm text-muted-foreground">You don't have any new notifications.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'network' && (
                        <motion.div
                            key="network"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <NetworkSection />
                        </motion.div>
                    )}

                    {(activeTab === 'market' || activeTab === 'requests') && (
                        <motion.div
                            key="market"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <MarketSection />
                        </motion.div>
                    )}

                    {activeTab === 'membership' && (
                        <motion.div
                            key="membership"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <MembershipSection />
                        </motion.div>
                    )}

                    {activeTab === 'products' && (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ProductsSection />
                        </motion.div>
                    )}

                    {activeTab === 'purchases' && (
                        <motion.div
                            key="purchases"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <PurchasesSection />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
