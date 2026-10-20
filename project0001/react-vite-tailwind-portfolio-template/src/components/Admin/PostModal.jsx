import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Loader2, Check, AlertCircle, Eye, Save } from 'lucide-react';
import { useCreateTipMutation, useUpdateTipMutation } from '../../features/Api/adminApi';

const PostModal = ({ isOpen, onClose, postToEdit }) => {
    const [createTip, { isLoading: isCreating }] = useCreateTipMutation();
    const [updateTip, { isLoading: isUpdating }] = useUpdateTipMutation();

    const [form, setForm] = useState({
        title: '',
        content: '',
        excerpt: '',
        status: 'draft',
        slug: ''
    });

    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (postToEdit) {
            setForm({
                title: postToEdit.title,
                content: postToEdit.content,
                excerpt: postToEdit.excerpt || '',
                status: postToEdit.status || 'draft',
                slug: postToEdit.slug || ''
            });
        }
    }, [postToEdit]);

    const handleTitleChange = (val) => {
        const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setForm({ ...form, title: val, slug });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (postToEdit) {
                await updateTip({ id: postToEdit.id, ...form }).unwrap();
                setStatus({ success: true, message: 'Post updated!' });
            } else {
                await createTip(form).unwrap();
                setStatus({ success: true, message: 'Post created!' });
            }
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 1000);
        } catch (err) {
            setStatus({ success: false, message: 'Operation failed' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <FileText className="w-6 h-6 text-blue-600" />
                        {postToEdit ? 'Edit Post' : 'Create New Post'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Post Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="Enter a catchy title..."
                                    required
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Slug: /blog/{form.slug}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Content (Markdown supported)</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-4 h-96 focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 dark:text-white"
                                    placeholder="Write your content here..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Publication Settings</h3>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Excerpt</label>
                                    <textarea
                                        value={form.excerpt}
                                        onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                        className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs h-32"
                                        placeholder="Brief summary for SEO..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2">Editor Tips</h3>
                                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-4">
                                    <li>Use # for headings</li>
                                    <li>Use images to break text</li>
                                    <li>Slug is auto-generated</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center flex-shrink-0">
                    <button
                        onClick={() => {/* Preview logic */ }}
                        className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all text-gray-700 dark:text-gray-300"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>

                    <div className="flex gap-4 items-center">
                        {status && (
                            <span className={`text-sm font-medium ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                                {status.message}
                            </span>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isCreating || isUpdating}
                            className="bg-green-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-2"
                        >
                            {(isCreating || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {postToEdit ? 'Save Changes' : 'Publish Post'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PostModal;
