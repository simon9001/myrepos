import React from 'react';
import { useGetPublicServicesQuery } from '../features/Api/publicApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageCarousel from '../components/common/ImageCarousel';
import ProjectCropDetailModal from '../components/common/ProjectCropDetailModal';

const Services = () => {
    const { data, isLoading, error } = useGetPublicServicesQuery({});
    const [selectedService, setSelectedService] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] text-red-500">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p>Failed to load services. Please try again later.</p>
            </div>
        );
    }

    const services = data?.services || [];

    return (
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Our Services
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Professional agricultural consultation and support
                </p>
            </motion.div>

            {services.length === 0 ? (
                <p className="text-center text-gray-500">No services available at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow group h-full flex flex-col cursor-pointer"
                            onClick={() => {
                                setSelectedService(service);
                                setIsDetailOpen(true);
                            }}
                        >
                            <div className="h-48 relative overflow-hidden">
                                <ImageCarousel
                                    images={[
                                        service.featured_media?.optimized_url || service.featured_media?.url,
                                        ...(service.service_crops?.flatMap(sc => [
                                            sc.featured_media?.optimized_url || sc.featured_media?.url
                                        ]) || [])
                                    ].filter(Boolean)}
                                />
                                <div className="absolute top-3 right-3">
                                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {service.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                    {service.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-green-600">
                                        {service.price ? `Ksh ${service.price}` : 'Contact for Price'}
                                    </span>
                                    <Link
                                        to={`/booking?serviceId=${service.id}`}
                                        className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <ProjectCropDetailModal
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        data={selectedService}
                        type="service"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Services;
