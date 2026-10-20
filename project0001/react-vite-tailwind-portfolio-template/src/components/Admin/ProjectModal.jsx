import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Loader2, Check, AlertCircle, Save } from 'lucide-react';
import { useCreateProjectMutation, useUpdateProjectMutation } from '../../features/Api/adminApi';
import ImageUpload from '../common/ImageUpload';
import MultiImageUpload from '../common/MultiImageUpload';

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
    const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'ongoing',
        start_date: '',
        end_date: '',
        featured_media_id: '',
        media_ids: []
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (projectToEdit) {
            setForm({
                name: projectToEdit.name || projectToEdit.title || '',
                description: projectToEdit.description || '',
                status: projectToEdit.status || 'ongoing',
                start_date: projectToEdit.start_date || '',
                end_date: projectToEdit.end_date || '',
                featured_media_id: projectToEdit.featured_media_id || '',
                media_ids: projectToEdit.project_media?.map(m => m.media?.id) || []
            });
        } else {
            setForm({
                name: '',
                description: '',
                status: 'ongoing',
                start_date: '',
                end_date: '',
                featured_media_id: '',
                media_ids: []
            });
        }
    }, [projectToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean data: remove empty UUID strings and dates
            const dataToSubmit = { ...form };
            if (!dataToSubmit.featured_media_id) delete dataToSubmit.featured_media_id;
            if (!dataToSubmit.start_date) delete dataToSubmit.start_date;
            if (!dataToSubmit.end_date) delete dataToSubmit.end_date;

            if (projectToEdit) {
                await updateProject({ id: projectToEdit.id, ...dataToSubmit }).unwrap();
                setStatus({ success: true, message: 'Project updated!' });
            } else {
                await createProject(dataToSubmit).unwrap();
                setStatus({ success: true, message: 'Project created!' });
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

    const initialGallery = projectToEdit?.project_media?.map(pm => ({
        id: pm.media?.id,
        url: pm.media?.url,
        type: pm.media?.type
    })) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                        {projectToEdit ? 'Edit Project' : 'New Project'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Project Title</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            placeholder="e.g. Sustainable Irrigation Initiative"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 h-32 focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                            placeholder="Describe the project goals and impact..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUpload
                            label="Project Feature Image"
                            initialMediaId={form.featured_media_id}
                            onUploadComplete={handleFeatureImageUpload}
                        />
                        <MultiImageUpload
                            label="Project Gallery"
                            initialMedia={initialGallery}
                            onUploadComplete={handleGalleryUpload}
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="planned">Planned</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={e => setForm({ ...form, start_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={e => setForm({ ...form, end_date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {status.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
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
                            className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            {(isCreating || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {projectToEdit ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ProjectModal;
