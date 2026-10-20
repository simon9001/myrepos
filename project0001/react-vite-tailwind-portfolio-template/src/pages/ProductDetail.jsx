import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetProductDetailsQuery,
    usePlaceBidMutation,
    usePurchaseDirectMutation
} from '../features/Api/newSystemsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/Slice/AuthSlice';
import {
    Loader2,
    Gavel,
    ShoppingBag,
    MapPin,
    Box,
    Timer,
    BadgeCheck,
    ArrowLeft,
    AlertCircle,
    Calendar,
    ChevronRight,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isBuyer = user?.role === 'buyer';

    const [bidAmount, setBidAmount] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [isBuying, setIsBuying] = useState(false);

    const { data, isLoading, error } = useGetProductDetailsQuery(id);
    const product = data?.product;
    const highestBid = data?.highest_bid;

    const [placeBid, { isLoading: isBidding }] = usePlaceBidMutation();
    const [purchaseDirect, { isLoading: isPurchasing }] = usePurchaseDirectMutation();

    const handleBid = async (e) => {
        e.preventDefault();
        if (!isBuyer) return;
        try {
            await placeBid({ id, amount: Number(bidAmount) }).unwrap();
            setBidAmount('');
            alert('Bid placed successfully!');
        } catch (err) {
            alert(err?.data?.error || 'Failed to place bid');
        }
    };

    const handlePurchase = async () => {
        if (!isBuyer || !shippingAddress) return;
        try {
            await purchaseDirect({ product_id: id, shipping_address: shippingAddress }).unwrap();
            alert('Order placed successfully!');
            navigate('/dashboard');
        } catch (err) {
            alert(err?.data?.error || 'Failed to purchase');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;
    if (error || !product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    const daysToHarvest = product.harvest_date ? Math.ceil((new Date(product.harvest_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 mb-8 font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Market
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Media Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-800">
                                    <Box className="w-32 h-32" />
                                </div>
                            )}
                        </div>
                        {/* Thumbnail grid could go here */}
                    </div>

                    {/* Product Info & Actions */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${product.auction_enabled ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {product.auction_enabled ? 'Auction' : 'Fixed Price'}
                                </span>
                                {product.is_organic && (
                                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <BadgeCheck className="w-4 h-4" /> Organic Certified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{product.name}</h1>
                            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">{product.crop_type}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Quantity Available</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{product.quantity_available}</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-2xl font-black text-green-600 capitalize">{product.status}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
                            {product.auction_enabled ? (
                                <>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-gray-400 font-bold uppercase mb-1">Current Highest Bid</p>
                                            <p className="text-4xl font-black text-gray-900 dark:text-white">KES {highestBid || product.starting_bid_price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-amber-600 font-bold flex items-center gap-2 justify-end">
                                                <Timer className="w-4 h-4" /> Time Remaining
                                            </p>
                                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                                {product.auction_end_date ? new Date(product.auction_end_date).toLocaleDateString() : 'Active'}
                                            </p>
                                        </div>
                                    </div>

                                    {!isBuyer && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-amber-600" />
                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                Please <Link to="/register?role=buyer" className="font-bold underline">Register as Buyer</Link> to place a bid.
                                            </p>
                                        </div>
                                    )}

                                    {isBuyer && (
                                        <form onSubmit={handleBid} className="space-y-4">
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                                <input
                                                    type="number"
                                                    placeholder="Enter your bid amount"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    className="w-full pl-16 pr-6 py-5 bg-gray-50 dark:bg-emerald-950/20 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-black text-xl transition-all"
                                                />
                                            </div>
                                            <button
                                                disabled={isBidding || !bidAmount}
                                                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-lg shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                                            >
                                                {isBidding ? <Loader2 className="animate-spin" /> : <Gavel className="w-6 h-6" />}
                                                Place Higher Bid
                                            </button>
                                        </form>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-gray-400 font-bold uppercase mb-1">Fixed Price</p>
                                            <p className="text-4xl font-black text-gray-900 dark:text-white">KES {product.price}</p>
                                        </div>
                                        <ShoppingBag className="w-10 h-10 text-green-600 opacity-20" />
                                    </div>

                                    {!isBuyer && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-amber-600" />
                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                Please <Link to="/register?role=buyer" className="font-bold underline">Register as Buyer</Link> to purchase.
                                            </p>
                                        </div>
                                    )}

                                    {isBuyer && (
                                        <div className="space-y-4">
                                            {isBuying ? (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                    <textarea
                                                        placeholder="Enter shipping address..."
                                                        value={shippingAddress}
                                                        onChange={(e) => setShippingAddress(e.target.value)}
                                                        className="w-full p-6 bg-gray-50 dark:bg-emerald-950/20 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-medium transition-all h-32"
                                                    />
                                                    <div className="flex gap-4">
                                                        <button onClick={() => setIsBuying(false)} className="flex-1 py-4 text-gray-500 font-bold">Cancel</button>
                                                        <button
                                                            onClick={handlePurchase}
                                                            disabled={isPurchasing || !shippingAddress}
                                                            className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-600/20 disabled:opacity-50"
                                                        >
                                                            {isPurchasing ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Purchase'}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsBuying(true)}
                                                    className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-lg shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-all"
                                                >
                                                    <ShoppingBag className="w-6 h-6" /> Buy Now
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Description & Attributes */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-green-600" /> About this Produce
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800">
                                    {product.description || 'No detailed description provided.'}
                                </p>
                            </div>

                            {product.attributes && Object.keys(product.attributes).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(product.attributes).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="text-sm text-gray-400 font-bold uppercase">{key.replace('_', ' ')}</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white capitalize">{value.toString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
