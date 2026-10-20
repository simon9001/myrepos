import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, Loader2, Info, Plus, Trash2 } from 'lucide-react';

const marketProductSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    crop_type: z.string().min(2, 'Crop type is required'),
    description: z.string().optional(),
    quantity_available: z.string().min(1, 'Quantity is required'),
    price: z.number().optional().nullable(),
    auction_enabled: z.boolean().default(false),
    starting_bid_price: z.number().optional().nullable(),
    auction_end_date: z.string().optional().nullable(),
    harvest_date: z.string().optional().nullable(),
    status: z.enum(['upcoming', 'harvested', 'in_transit', 'delivered']).default('upcoming'),
    is_organic: z.boolean().default(false),
    is_published: z.boolean().default(false),
    attributes: z.record(z.string(), z.any()).optional(),
    images: z.array(z.string()).optional(),
});

const MarketProductModal = ({ isOpen, onClose, onSubmit, productToEdit, isLoading }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(marketProductSchema),
        defaultValues: {
            auction_enabled: false,
            is_organic: false,
            is_published: false,
            status: 'upcoming',
            attributes: {},
        }
    });

    const auctionEnabled = watch('auction_enabled');
    const attributes = watch('attributes') || {};

    useEffect(() => {
        if (productToEdit) {
            reset(productToEdit);
        } else {
            reset({
                auction_enabled: false,
                is_organic: false,
                is_published: false,
                status: 'upcoming',
                attributes: {},
            });
        }
    }, [productToEdit, reset]);

    const handleAddAttribute = () => {
        const key = prompt('Enter attribute name (e.g., certification, grade)');
        if (key) {
            setValue('attributes', { ...attributes, [key]: '' });
        }
    };

    const handleRemoveAttribute = (key) => {
        const newAttrs = { ...attributes };
        delete newAttrs[key];
        setValue('attributes', newAttrs);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
            >
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Configure marketplace listing details.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                            <input {...register('name')} placeholder="e.g., Premium Red Tomatoes" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" />
                            {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Crop Type</label>
                            <input {...register('crop_type')} placeholder="e.g., Tomatoes" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" />
                            {errors.crop_type && <p className="text-red-500 text-xs font-bold">{errors.crop_type.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea {...register('description')} placeholder="Describe the quality, size, and source..." className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium h-24 resize-none" />
                    </div>

                    {/* Logistics & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Quantity Available</label>
                            <input {...register('quantity_available')} placeholder="e.g., 500kg" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Logistics Status</label>
                            <select {...register('status')} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold appearance-none">
                                <option value="upcoming">Upcoming (Planting/Growing)</option>
                                <option value="harvested">Harvested (Ready)</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing Mode */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Enable Auction Mode</span>
                            </div>
                            <input type="checkbox" {...register('auction_enabled')} className="w-6 h-6 accent-green-600 cursor-pointer" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {!auctionEnabled ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fixed Price (KES)</label>
                                    <input type="number" {...register('price', { valueAsNumber: true })} className="w-full p-4 bg-white dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-black text-xl" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Starting Bid (KES)</label>
                                        <input type="number" {...register('starting_bid_price', { valueAsNumber: true })} className="w-full p-4 bg-white dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-black text-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Auction End Date</label>
                                        <input type="date" {...register('auction_end_date')} className="w-full p-4 bg-white dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Harvest Date</label>
                            <input type="date" {...register('harvest_date')} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold" />
                        </div>
                        <div className="flex flex-col gap-4 pt-6">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" {...register('is_organic')} id="is_organic" className="w-5 h-5 accent-emerald-500" />
                                <label htmlFor="is_organic" className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest cursor-pointer">Organic Certified</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" {...register('is_published')} id="is_published" className="w-5 h-5 accent-blue-500" />
                                <label htmlFor="is_published" className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest cursor-pointer">Publish Listing</label>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Attributes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Descriptors</label>
                            <button type="button" onClick={handleAddAttribute} className="text-xs font-black text-green-600 flex items-center gap-1 hover:underline">
                                <Plus className="w-3 h-3" /> Add Attr
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.keys(attributes).map((key) => (
                                <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{key}</p>
                                        <input
                                            value={attributes[key]}
                                            onChange={(e) => setValue('attributes', { ...attributes, [key]: e.target.value })}
                                            placeholder="Enter value"
                                            className="w-full bg-transparent border-none outline-none text-sm font-bold p-0 mt-1"
                                        />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveAttribute(key)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Save Product Listing'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default MarketProductModal;
