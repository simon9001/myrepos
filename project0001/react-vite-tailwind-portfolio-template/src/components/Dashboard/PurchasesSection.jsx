import React from 'react';
import {
    useGetMyOrdersQuery,
    useGetMyBidsQuery
} from '../../features/Api/newSystemsApi';
import {
    ShoppingBag,
    Gavel,
    Box,
    Truck,
    CheckCircle,
    Clock,
    Loader2,
    ExternalLink,
    AlertCircle,
    Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const PurchasesSection = () => {
    const { data: ordersData, isLoading: ordersLoading } = useGetMyOrdersQuery();
    const { data: bidsData, isLoading: bidsLoading } = useGetMyBidsQuery();

    const orders = ordersData?.orders || [];
    const bids = bidsData?.bids || [];

    const getDeliveryStatusIcon = (status) => {
        switch (status) {
            case 'upcoming': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'harvested': return <Package className="w-4 h-4 text-emerald-500" />;
            case 'in_transit': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Box className="w-4 h-4 text-gray-400" />;
        }
    };

    if (ordersLoading || bidsLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-12">
            {/* Active Bids Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Gavel className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Active Bids</h2>
                </div>

                {bids.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bids.map((bid) => (
                            <div key={bid.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{bid.product?.name}</h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Auction ends: {new Date(bid.product?.auction_end_date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">My Bid</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">KES {bid.amount}</p>
                                    </div>
                                    <button className="text-green-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                        View Product <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-900/20 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">No active bids found.</p>
                    </div>
                )}
            </section>

            {/* Orders Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Orders</h2>
                </div>

                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
                                {/* Order Status Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    {getDeliveryStatusIcon(order.delivery_status)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.product?.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {order.payment_status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {order.delivery_status}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {order.shipping_address || 'Collection Point'}</span>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">KES {order.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-900/20 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                        <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PurchasesSection;
