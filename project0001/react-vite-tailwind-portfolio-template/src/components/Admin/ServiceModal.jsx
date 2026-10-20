import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sprout, Check, AlertCircle } from 'lucide-react';
import {
    useCreateServiceMutation,
    useUpdateServiceMutation
} from '../../features/Api/adminApi';
import { useGetPublicCropsQuery } from '../../features/Api/publicApi';
import ImageUpload from '../common/ImageUpload';

const ServiceModal = ({ isOpen, onClose, serviceToEdit }) => {
    const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
    const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
    const { data: cropsData } = useGetPublicCropsQuery({});

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        duration_mins: 30,
        featured_media_id: '',
        crops: [] // Array of crop IDs
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (serviceToEdit) {
            setForm({
                name: serviceToEdit.name,
                description: serviceToEdit.description,
                price: serviceToEdit.price,
                duration_mins: serviceToEdit.duration_mins || serviceToEdit.duration || 30,
                featured_media_id: serviceToEdit.featured_media_id || '',
                crops: serviceToEdit.service_crops?.map(c => c.id) || []
            });
        }
    }, [serviceToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                duration_mins: parseInt(form.duration_mins)
            };
            // Remove duration if it conflicts differently or map it correctly. 
            // The schema expects duration_mins, but form has duration. 
            // In init: duration: 30.
            // Let's verify backend schema: duration_mins.

            if (serviceToEdit) {
                await updateService({ id: serviceToEdit.id, ...payload }).unwrap();
                setStatus({ success: true, message: 'Service updated successfully!' });
            } else {
                await createService(payload).unwrap();
                setStatus({ success: true, message: 'Service created successfully!' });
            }
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 1500);
        } catch (err) {
            setStatus({ success: false, message: err.data?.error || 'Operation failed' });
        }
    };

    const toggleCrop = (cropId) => {
        setForm(prev => ({
            ...prev,
            crops: prev.crops.includes(cropId)
                ? prev.crops.filter(id => id !== cropId)
                : [...prev.crops, cropId]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sprout className="w-6 h-6 text-green-600" />
                        {serviceToEdit ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Service Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                placeholder="Consultation Type"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Price (KES)</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                placeholder="2500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Duration (Minutes)</label>
                            <select
                                value={form.duration_mins}
                                onChange={e => setForm({ ...form, duration_mins: parseInt(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                required
                            >
                                <option value={30}>30 Minutes</option>
                                <option value={60}>1 Hour</option>
                                <option value={90}>1.5 Hours</option>
                                <option value={120}>2 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-green-500 h-24 text-gray-900 dark:text-white"
                            placeholder="Describe what is covered in this session..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Linked Crops</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {cropsData?.crops?.map(crop => (
                                <button
                                    key={crop.id}
                                    type="button"
                                    onClick={() => toggleCrop(crop.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.crops.includes(crop.id)
                                        ? 'bg-green-600 border-green-600 text-white'
                                        : 'border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-green-600'
                                        }`}
                                >
                                    <Sprout className="w-3 h-3" />
                                    {crop.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {status.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <div className="pt-4 flex flex-col md:flex-row gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 dark:shadow-none"
                        >
                            {(isCreating || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {serviceToEdit ? 'Save Changes' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </motion.div>

        </div>
    );
};

export default ServiceModal;
