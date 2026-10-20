import React, { useState } from 'react';
import { useGetPublicProjectsQuery } from '../features/Api/publicApi';
import ImageCarousel from '../components/common/ImageCarousel';
import ProjectCropDetailModal from '../components/common/ProjectCropDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Calendar, MapPin, Loader2 } from 'lucide-react';

const Projects = () => {
    const { data: projectsData, isLoading, error } = useGetPublicProjectsQuery();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
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
            <div className="flex justify-center items-center min-h-[50vh] text-red-500">
                Failed to load projects. Please try again later.
            </div>
        );
    }

    const projects = projectsData?.projects || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Projects</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Take a look at some of the farming success stories and implementations we've delivered.
                </p>
            </motion.div>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group cursor-pointer"
                            onClick={() => {
                                setSelectedProject(project);
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
                                <div className="absolute top-4 left-4">
                                    <span className="bg-green-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                                        {project.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 transition-colors">
                                    {project.name}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                                        <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Active Project'}</span>
                                    </div>
                                    <div className="text-green-600 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                                        View Case <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {projects.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No projects found at the moment.
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <ProjectCropDetailModal
                        isOpen={isDetailOpen}
                        onClose={() => setIsDetailOpen(false)}
                        data={selectedProject}
                        type="project"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
