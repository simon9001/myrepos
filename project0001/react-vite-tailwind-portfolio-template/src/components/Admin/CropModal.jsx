import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sprout, Loader2, Check, AlertCircle } from 'lucide-react';
import { useCreateCropMutation, useUpdateCropMutation } from '../../features/Api/adminApi';
import ImageUpload from '../common/ImageUpload';
import MultiImageUpload from '../common/MultiImageUpload';

const CropModal = ({ isOpen, onClose, cropToEdit }) => {
    const [createCrop, { isLoading: isCreating }] = useCreateCropMutation();
    const [updateCrop, { isLoading: isUpdating }] = useUpdateCropMutation();

    const [form, setForm] = useState({
        name: '',
        scientific_name: '',
        category: 'vegetable',
        growing_season: '',
        description: '',
        featured_media_id: '',
        media_ids: []
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (cropToEdit) {
            setForm({
                name: cropToEdit.name,
                scientific_name: cropToEdit.scientific_name || '',
                category: cropToEdit.category || 'vegetable',
                growing_season: cropToEdit.growing_season || '',
                description: cropToEdit.description || '',
                featured_media_id: cropToEdit.featured_media_id || '',
                media_ids: cropToEdit.crop_media?.map(m => m.media?.id) || []
            });
        }
    }, [cropToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean data: remove empty UUID strings
            const dataToSubmit = { ...form };
            if (!dataToSubmit.featured_media_id) delete dataToSubmit.featured_media_id;

            if (cropToEdit) {
                await updateCrop({ id: cropToEdit.id, ...dataToSubmit }).unwrap();
                setStatus({ success: true, message: 'Crop updated!' });
            } else {
                await createCrop(dataToSubmit).unwrap();
                setStatus({ success: true, message: 'Crop created!' });
            }
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 1000);
        } catch (err) {
            setStatus({ success: false, message: 'Operation failed' });
        }
    };

    const handleFeatureImageUpload = React.useCallback((mediaId) => {
        setForm(prev => ({ ...prev, featured_media_id: mediaId }));
    }, []);

    const handleGalleryUpload = React.useCallback((mediaIds) => {
        setForm(prev => ({ ...prev, media_ids: mediaIds }));
    }, []);

    if (!isOpen) return null;

    const initialGallery = cropToEdit?.crop_media?.map(cm => ({
        id: cm.media?.id,
        url: cm.media?.url,
        type: cm.media?.type
    })) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sprout className="w-6 h-6 text-green-600" />
                        {cropToEdit ? 'Edit Crop' : 'Add New Crop'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Crop Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                            placeholder="e.g. Tomato"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Scientific Name</label>
                            <input
                                type="text"
                                value={form.scientific_name}
                                onChange={e => setForm({ ...form, scientific_name: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-xs text-gray-900 dark:text-white"
                                placeholder="Solanum lycopersicum"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-xs text-gray-900 dark:text-white"
                            >
                                <option value="vegetable">Vegetable</option>
                                <option value="fruit">Fruit</option>
                                <option value="cereal">Cereal</option>
                                <option value="legume">Legume</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Growing Season</label>
                        <input
                            type="text"
                            value={form.growing_season}
                            onChange={e => setForm({ ...form, growing_season: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                            placeholder="e.g. March - June"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 h-24 text-gray-900 dark:text-white"
                            placeholder="General information about the crop..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUpload
                            label="Feature Image"
                            initialMediaId={form.featured_media_id}
                            onUploadComplete={handleFeatureImageUpload}
                        />
                        <MultiImageUpload
                            label="Gallery Images"
                            initialMedia={initialGallery}
                            onUploadComplete={handleGalleryUpload}
                        />
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {status.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <button
                        disabled={isCreating || isUpdating}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        {(isCreating || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {cropToEdit ? 'Update Crop' : 'Create Crop'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CropModal;
