import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Globe, Mail, Phone, FileText, Tag, Building2 } from 'lucide-react';
import { useApplySponsorMutation } from '../features/Api/newSystemsApi';

const sponsorSchema = z.object({
    company_name: z.string().min(2, 'Company name is required'),
    registration_number: z.string().optional(),
    tax_pin: z.string().optional(),
    website: z.string().url('Invalid website URL').or(z.literal('')),
    contact_email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    product_category: z.string().optional(),
});

const SponsorApply = () => {
    const navigate = useNavigate();
    const [applySponsor, { isLoading }] = useApplySponsorMutation();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(sponsorSchema),
    });

    const onSubmit = async (data) => {
        try {
            // Filter out empty strings for optional fields
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== '')
            );

            await applySponsor(cleanData).unwrap();
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to submit application:', err);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-green-100 dark:border-green-900/30 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-green-600 p-8 text-white text-center">
                        <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h1 className="text-3xl font-black mb-2">Sponsor Application</h1>
                        <p className="text-green-50/80">
                            Partner with us to empower smallholder farmers and grow your brand impact.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Building2 className="w-4 h-4 text-green-600" />
                                    Company Name *
                                </label>
                                <input
                                    {...register('company_name')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. AgriCorp Ltd"
                                />
                                {errors.company_name && <p className="text-red-500 text-xs">{errors.company_name.message}</p>}
                            </div>

                            {/* Product Category */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Tag className="w-4 h-4 text-green-600" />
                                    Product/Service Category
                                </label>
                                <input
                                    {...register('product_category')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="e.g. Fertilizers, Logistics, Finance"
                                />
                            </div>

                            {/* Contact Email */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Mail className="w-4 h-4 text-green-600" />
                                    Contact Email *
                                </label>
                                <input
                                    {...register('contact_email')}
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="partnerships@company.com"
                                />
                                {errors.contact_email && <p className="text-red-500 text-xs">{errors.contact_email.message}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Phone className="w-4 h-4 text-green-600" />
                                    Phone Number
                                </label>
                                <input
                                    {...register('phone')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="+254..."
                                />
                            </div>

                            {/* Website */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <Globe className="w-4 h-4 text-green-600" />
                                    Website URL
                                </label>
                                <input
                                    {...register('website')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder="https://www.company.com"
                                />
                                {errors.website && <p className="text-red-500 text-xs">{errors.website.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <FileText className="w-4 h-4 text-green-600" />
                                    Company/Mission Description *
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                                    placeholder="Briefly describe your company and why you'd like to sponsor our community..."
                                />
                                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                            </div>

                            {/* Reg Info */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Business Registration #</label>
                                <input
                                    {...register('registration_number')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tax PIN (KRA)</label>
                                <input
                                    {...register('tax_pin')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    By submitting this application, you agree to our Terms of Service. All applications are subject to manual review by our administration.
                </p>
            </div>
        </div>
    );
};

export default SponsorApply;
