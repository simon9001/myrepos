import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ArrowRight, Tag, Info } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

const ProjectCropDetailModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const images = [
        data.featured_media?.optimized_url || data.featured_media?.url,
        ...(type === 'project'
            ? (data.project_media?.map(pm => pm.media?.optimized_url || pm.media?.url) || [])
            : (data.crop_media?.map(cm => cm.media?.optimized_url || cm.media?.url) || [])
        )
    ].filter(Boolean);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/20 dark:shadow-black/40 border border-gray-100 dark:border-gray-800"
            >
                {/* Header for Mobile */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Left Side: Images */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-gray-800 relative">
                    <ImageCarousel images={images} className="h-full" />
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto flex flex-col">
                    <div className="hidden md:flex justify-end mb-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                {type}
                            </span>
                            {data.status && (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                    {data.status}
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {data.name}
                        </h2>
                    </div>

                    <div className="space-y-6 flex-grow">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {data.start_date && (
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                                    <Calendar className="w-4 h-4 text-green-500" />
                                    <span>Starts: {new Date(data.start_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {data.end_date && (
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span>Ends: {new Date(data.end_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            {data.scientific_name && (
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl italic">
                                    <Tag className="w-4 h-4 text-indigo-500" />
                                    <span>{data.scientific_name}</span>
                                </div>
                            )}
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-2">
                                <Info className="w-4 h-4 text-green-500" />
                                Description
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {data.description || "No description available."}
                            </p>
                        </div>

                        {type === 'crop' && data.service_crops && data.service_crops.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-gray-900 dark:text-white font-bold mb-3">
                                    <Tag className="w-4 h-4 text-green-500" />
                                    Related Services
                                </h4>
                                <div className="space-y-2">
                                    {data.service_crops.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-800/30">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.name}</span>
                                            <span className="text-sm font-bold text-green-600">Ksh {service.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 group">
                            Book Consultation
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectCropDetailModal;
