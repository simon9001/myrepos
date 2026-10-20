import React from 'react';
import { useGetPublicTestimonialsQuery } from '../features/Api/publicApi';
import { motion } from 'framer-motion';
import { Loader2, Star, Quote } from 'lucide-react';

const Testimonials = () => {
    const { data, isLoading, error } = useGetPublicTestimonialsQuery({});

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[50vh] text-red-500">
                Failed to load testimonials. Please try again later.
            </div>
        );
    }

    const testimonials = data?.testimonials || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Client Testimonials</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Don't just take our word for it. Here's what our farming partners have to say.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-green-50 dark:border-green-900 relative"
                    >
                        <Quote className="absolute top-6 right-6 w-8 h-8 text-green-100 dark:text-green-900 transform rotate-12" />

                        <div className="flex items-center gap-1 mb-6 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6 italic relative z-10">
                            "{testimonial.comment}"
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {testimonial.user_media?.optimized_url ? (
                                    <img
                                        src={testimonial.user_media.optimized_url}
                                        alt={testimonial.user_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold">
                                        {testimonial.user_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.user_name}</h4>
                                {testimonial.project && (
                                    <p className="text-xs text-green-600 font-medium">{testimonial.project.name}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No testimonials available yet.
                </div>
            )}
        </div>
    );
};

export default Testimonials;
