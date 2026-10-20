import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ExternalLink, ShieldCheck, Loader2, Award } from 'lucide-react';
import { useGetPublicSponsorsQuery } from '../features/Api/newSystemsApi';
import { Link } from 'react-router-dom';

const Partners = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch public sponsors
    const { data, isLoading, error } = useGetPublicSponsorsQuery();

    const sponsors = data?.sponsors?.filter(s =>
        s.sponsor?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sponsor?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unavailable</h2>
                <p className="text-gray-600 dark:text-gray-400">Unable to load sponsors list at this time.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl mb-4 leading-tight"
                    >
                        Sponsorship & Brand Collaboration
                    </motion.h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Empowering agriculture through strategic partnerships. Join us in building a sustainable future for farmers and the global food supply chain.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 px-4">
                        <Link
                            to="/register?role=sponsor"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all hover:scale-105 shadow-lg shadow-green-600/20"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Become a Sponsor
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-500 rounded-full font-bold hover:bg-green-50 dark:hover:bg-gray-700 transition-all hover:scale-105 shadow-lg"
                        >
                            <Award className="w-5 h-5" />
                            Partner with Us
                        </Link>
                    </div>
                    pre
                </div>

                {/* Search */}
                <div className="relative max-w-md mx-auto mb-12">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search partners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Sponsors Grid */}
                {sponsors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sponsors.map((sponsorship, index) => (
                            <motion.div
                                key={sponsorship.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-green-50 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-xl">
                                        {sponsorship.sponsor?.company_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {sponsorship.sponsor?.company_name}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            <ShieldCheck className="w-3 h-3" /> {sponsorship.tier} Sponsor
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                                    {sponsorship.sponsor?.description || "No description provided."}
                                </p>

                                <div className="flex gap-3">
                                    {sponsorship.sponsor?.website && (
                                        <a
                                            href={sponsorship.sponsor.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg">No sponsors found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Partners;
