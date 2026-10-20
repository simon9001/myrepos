import React, { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Box,
    MapPin,
    Clock,
    Loader2,
    Truck,
    CheckCircle,
    Plus,
    Gavel,
    ShoppingBag,
    Trash2,
    Edit3,
    AlertCircle
} from 'lucide-react';
import {
    useGetMarketRequestsQuery,
    useGetAllAdminProductsQuery,
    useCreateAdminProductMutation
} from '../../features/Api/newSystemsApi';
import MarketProductModal from './MarketProductModal';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMarket = () => {
    const [activeTab, setActiveTab] = useState('requests'); // requests, products
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Queries
    const { data: requestsData, isLoading: requestsLoading } = useGetMarketRequestsQuery();
    const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useGetAllAdminProductsQuery();

    // Mutations
    const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();

    const requests = requestsData?.requests?.filter(r =>
        r.crop_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const products = productsData?.products?.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.crop_type?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleCreateProduct = async (data) => {
        try {
            await createProduct(data).unwrap();
            setIsModalOpen(false);
            refetchProducts();
        } catch (err) {
            alert(err?.data?.error || 'Failed to save product');
        }
    };

    if (requestsLoading || productsLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            {/* Tab Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl w-full md:w-fit">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        Market Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        Market Products
                    </button>
                </div>

                {activeTab === 'products' && (
                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Create Product
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'requests' ? "Search requests..." : "Search products..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 md:flex-none px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 border-none outline-none"
                        >
                            <option value="">All Statuses</option>
                            {activeTab === 'requests' ? (
                                <>
                                    <option value="open">Open</option>
                                    <option value="matched">Matched</option>
                                    <option value="completed">Completed</option>
                                </>
                            ) : (
                                <>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="harvested">Harvested</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">{activeTab === 'requests' ? 'Request Details' : 'Product Details'}</th>
                                <th className="px-8 py-5">{activeTab === 'requests' ? 'Buyer' : 'Type/Pricing'}</th>
                                <th className="px-8 py-5">{activeTab === 'requests' ? 'Quantity/Budget' : 'Inventory'}</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {activeTab === 'requests' ? (
                                requests.length > 0 ? (
                                    requests.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center font-bold text-green-600">
                                                        <Box className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white capitalize text-base">{r.crop_type}</p>
                                                        <p className="flex items-center gap-1 text-xs text-gray-400 font-bold"><MapPin className="w-3 h-3" /> {r.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-gray-900 dark:text-white font-bold text-sm">Buyer ID: {r.buyer_id.slice(0, 8)}</p>
                                                <p className="text-xs text-gray-400 font-medium">{r.timeline}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-gray-900 dark:text-white text-base">{r.quantity}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase">{r.budget_range || 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.status === 'open' ? 'bg-green-100 text-green-700' :
                                                    r.status === 'matched' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold">No requests found.</td></tr>
                                )
                            ) : (
                                products.length > 0 ? (
                                    products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
                                                        {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white text-base">{p.name}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.crop_type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${p.auction_enabled ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                        {p.auction_enabled ? 'Auction' : 'Fixed Price'}
                                                    </span>
                                                    <p className="font-black text-gray-900 dark:text-white">KES {p.auction_enabled ? p.starting_bid_price : p.price}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-black text-gray-900 dark:text-white text-base">{p.quantity_available}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Stock Level</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'harvested' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold">No products found.</td></tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <MarketProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProduct}
                productToEdit={editingProduct}
                isLoading={isCreating}
            />
        </div>
    );
};

export default AdminMarket;

