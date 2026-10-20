import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Quote, Loader2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import {
    useGetPublicCropsQuery,
    useGetPublicProjectsQuery,
    useGetPublicTestimonialsQuery,
    useGetPublicServicesQuery,
    useGetPublicTipsQuery
} from '../features/Api/publicApi';
import FloatingTips from '../components/FloatingTips';
import About from '../components/About';
import ImageCarousel from '../components/common/ImageCarousel';
import ProjectCropDetailModal from '../components/common/ProjectCropDetailModal';

import img002 from '../assets/002.jpeg';
import img003 from '../assets/0003.jpeg';
import img004 from '../assets/004.jpeg';
import img005 from '../assets/005.jpeg';
import img008 from '../assets/008.jpeg';
import img006 from '../assets/006.jpeg';
import img007 from '../assets/007.jpeg';
import img009 from '../assets/009.jpeg';
import img010 from '../assets/010.jpeg';


const HERO_IMAGES = [
    img002,
    img003,
    img004,
    img005,
    img006,
    img007,
    img008,
    img009,
    img010
];


const Home = () => {
    // Fetch featured data
    const { data: cropsData, isLoading: cropsLoading } = useGetPublicCropsQuery({ featured: true, limit: 3 });
    const { data: projectsData, isLoading: projectsLoading } = useGetPublicProjectsQuery({ featured: true, limit: 3 });
    const { data: testimonialsData, isLoading: testimonialsLoading } = useGetPublicTestimonialsQuery({ featured: true, limit: 3 });
    const { data: servicesData, isLoading: servicesLoading } = useGetPublicServicesQuery({ featured: true, limit: 3 });

    const [selectedItem, setSelectedItem] = useState(null);
    const [detailType, setDetailType] = useState('project');
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: tipsData } = useGetPublicTipsQuery({ limit: 5 });
    const [forceShowTips, setForceShowTips] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Hero Image Slider Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const featuredCrops = cropsData?.crops || [];
    const featuredProjects = projectsData?.projects || [];
    const testimonials = testimonialsData?.testimonials || [];
    const featuredServices = servicesData?.services || [];
    const tips = tipsData?.tips || [];

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-green-900 text-white">
                {/* Floating Tips */}
                <FloatingTips forceShow={forceShowTips} onDismiss={() => setForceShowTips(false)} />

                {/* Tips Dropdown/Toggle */}
                {tips.length > 0 && (
                    <div className="absolute top-4 right-4 z-40">
                        <motion.div className="flex flex-col items-end">
                            <button
                                onClick={() => setForceShowTips(!forceShowTips)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full transition-all"
                            >
                                <Lightbulb className={`w-4 h-4 ${forceShowTips ? 'text-yellow-400' : 'text-gray-300'}`} />
                                <span className="text-sm font-medium">Tips</span>
                                {forceShowTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <AnimatePresence>
                                {forceShowTips && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 overflow-hidden"
                                    >
                                        <div className="max-h-60 overflow-y-auto no-scrollbar">
                                            {tips.map((tip) => (
                                                <div
                                                    key={tip.id}
                                                    className="p-3 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors cursor-default"
                                                >
                                                    <h4 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                                                        {tip.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        {tip.excerpt || tip.content.substring(0, 60)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}

                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={HERO_IMAGES[currentImageIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            alt="Farm Landscape"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight leading-tight"
                    >
                        Welcome to <span className="text-green-400">Farm with Irene</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto"
                    >
                        Professional Agricultural Consultation & Sustainable Farming Solutions
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/services" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
                            Explore Services
                        </Link>
                        <Link to="/contact" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all">
                            Contact Us
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section className="bg-white dark:bg-gray-900 overflow-hidden">
                <About />
            </section>

            {/* Featured Services Section */}
            <section className="py-20 bg-green-50/50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
                        <div className="w-20 h-1 bg-green-500 mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We offer professional agricultural consultation to help you succeed in farming.
                        </p>
                    </div>

                    {servicesLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {featuredServices.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="h-48 overflow-hidden">
                                        {(service.featured_media?.optimized_url || service.featured_media?.url) ? (
                                            <img
                                                src={service.featured_media.optimized_url || service.featured_media.url}
                                                alt={service.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                                {service.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{service.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-green-600">
                                                {service.price ? `Ksh ${service.price}` : 'Contact Us'}
                                            </span>
                                            <Link
                                                to={`/booking?serviceId=${service.id}`}
                                                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                                            >
                                                Book <ArrowRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/services" className="inline-block border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-6 py-3 rounded-lg font-medium transition-colors">
                            View More Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Crops Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Expertise</h2>
                        <div className="w-20 h-1 bg-green-500 mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Specializing in high-value crops and modern farming techniques to maximize your yield.
                        </p>
                    </div>

                    {cropsLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {featuredCrops.map((crop, index) => (
                                <motion.div
                                    key={crop.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSelectedItem(crop);
                                        setDetailType('crop');
                                        setIsDetailOpen(true);
                                    }}
                                >
                                    <div className="h-48 overflow-hidden">
                                        <ImageCarousel
                                            images={[
                                                crop.featured_media?.optimized_url || crop.featured_media?.url,
                                                ...(crop.crop_media?.map(cm => cm.media?.optimized_url || cm.media?.url) || [])
                                            ].filter(Boolean)}
                                            className="transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{crop.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{crop.description}</p>
                                        <div className="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
                                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/services" className="inline-block border border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition-colors">
                            View All Crops & Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="py-20 bg-green-50 dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Featured Projects</h2>
                        <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
                    </div>

                    {projectsLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg cursor-pointer group"
                                    onClick={() => {
                                        setSelectedItem(project);
                                        setDetailType('project');
                                        setIsDetailOpen(true);
                                    }}
                                >
                                    <div className="h-64 relative">
                                        <ImageCarousel
                                            images={[
                                                project.featured_media?.optimized_url || project.featured_media?.url,
                                                ...(project.project_media?.map(pm => pm.media?.optimized_url || pm.media?.url) || [])
                                            ].filter(Boolean)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                                            <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                                            <p className="text-gray-300 text-sm line-clamp-1">{project.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Link to="/projects" className="inline-flex items-center text-green-600 font-medium hover:text-green-700">
                            See All Projects <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white dark:bg-gray-900 border-t border-green-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Transforming farms and lives through dedicated service and expertise.
                        </p>
                    </div>

                    {testimonialsLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-green-50 dark:bg-gray-800/50 p-8 rounded-2xl relative"
                                >
                                    <Quote className="w-10 h-10 text-green-200 dark:text-green-900/30 absolute top-6 right-6" />
                                    <div className="flex gap-1 text-yellow-500 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.comment}"</p>
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
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/testimonials"
                            className="inline-block bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            Read More Success Stories
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Farm?</h2>
                    <p className="text-xl text-green-50 mb-8">
                        Book a consultation today and let's start your journey to sustainable and profitable farming.
                    </p>
                    <Link
                        to="/booking"
                        className="inline-block bg-white text-green-700 dark:bg-green-500 dark:text-white px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 hover:bg-green-50 dark:hover:bg-green-400 shadow-xl hover:shadow-2xl"
                    >
                        Book an Appointment Now
                    </Link>
                </div>
            </section>

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <ProjectCropDetailModal
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        data={selectedItem}
                        type={detailType}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
