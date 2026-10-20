import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingBag,
    Gavel,
    Timer,
    MapPin,
    Box,
    Loader2,
    ChevronRight,
    BadgeCheck,
    Info,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useGetPublicProductsQuery } from '../features/Api/newSystemsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/Slice/AuthSlice';
import { Link, useNavigate } from 'react-router-dom';

const Market = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, fixed, auction
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isBuyer = user?.role === 'buyer';

    const { data, isLoading, error } = useGetPublicProductsQuery();
    const products = data?.products || [];

    const filteredProducts = useMemo(() => {
        return products
            .map(p => ({
                ...p,
                membership_tier: p.farmer?.memberships?.[0]?.tier || 'free'
            }))
            .filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.crop_type.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesFilter = filter === 'all' ||
                    (filter === 'fixed' && !p.auction_enabled) ||
                    (filter === 'auction' && p.auction_enabled);
                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                // Priority Ranking: Premium first
                if (a.membership_tier === 'premium' && b.membership_tier !== 'premium') return -1;
                if (a.membership_tier !== 'premium' && b.membership_tier === 'premium') return 1;
                // Then by date
                return new Date(b.created_at) - new Date(a.created_at);
            });
    }, [products, searchTerm, filter]);

    const calculateDaysRemaining = (dateString) => {
        if (!dateString) return null;
        const diff = new Date(dateString) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (isLoading) return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white"
                        >
                            Produce <span className="text-green-600">Marketplace</span>
                        </motion.h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Discover quality farm products and competitive bidding.
                        </p>
                    </div>

                    {!isBuyer && isAuthenticated && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                            <Info className="w-5 h-5 text-amber-600" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Register as a <span className="font-bold underline">Buyer</span> to place bids or purchase.
                            </p>
                        </div>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by crop or product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
                        {['all', 'fixed', 'auction'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const daysToHarvest = calculateDaysRemaining(product.harvest_date);
                            const isUpcoming = product.status === 'upcoming';

                            return (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                                                <Box className="w-12 h-12" />
                                            </div>
                                        )}
                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${product.auction_enabled ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {product.auction_enabled ? 'Auction' : 'Direct sale'}
                                            </span>
                                            {product.is_organic && (
                                                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                    <BadgeCheck className="w-3 h-3" /> Organic
                                                </span>
                                            )}
                                            {product.membership_tier === 'premium' && (
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                    <BadgeCheck className="w-3 h-3" /> Verified Farmer
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.crop_type}</p>
                                        </div>

                                        <div className="space-y-3 mb-6 flex-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Box className="w-4 h-4 text-green-500" />
                                                <span>Qty: <span className="font-bold text-gray-900 dark:text-white">{product.quantity_available}</span></span>
                                            </div>

                                            {isUpcoming && daysToHarvest !== null && (
                                                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/10 p-2 rounded-xl">
                                                    <Timer className="w-4 h-4" />
                                                    <span>Ready in {daysToHarvest} days</span>
                                                </div>
                                            )}

                                            {!isUpcoming && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Status: {product.status}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price Section */}
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                                            <div>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
                                                    {product.auction_enabled ? 'Starting Bid' : 'Price'}
                                                </p>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                    KES {product.auction_enabled ? product.starting_bid_price : product.price}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/market/product/${product.id}`)}
                                                className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all group/btn shadow-sm"
                                            >
                                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Market;

