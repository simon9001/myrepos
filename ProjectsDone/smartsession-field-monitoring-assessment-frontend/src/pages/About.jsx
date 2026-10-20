import React from 'react';
import { Target, Users, ShieldCheck } from 'lucide-react';

const About = () => {
    return (
        <main className="flex-grow">
            {/* Header */}
            <div className="bg-green-800 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">About SmartSession</h1>
                    <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                        Empowering agriculture through intelligent field monitoring and tracking.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            At SmartSession, we believe that modern agriculture requires modern solutions. We provide coordinators and field agents with the tools they need to track crop lifecycles efficiently, ensuring maximum yield and minimizing risks.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Our platform simplifies field assignments, real-time stage monitoring, and risk assessment, bringing clarity and actionable insights to your daily agricultural operations.
                        </p>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-2xl relative">
                        <img 
                            src="https://images.unsplash.com/photo-1592982537447-6f296d0547db?q=80&w=2070&auto=format&fit=crop" 
                            alt="Farming technology" 
                            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Values */}
                <div className="mt-24">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
                            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-6">
                                <Target className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Precision</h3>
                            <p className="text-gray-600">Accurate tracking from planting to harvest, leaving nothing to guesswork.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Collaboration</h3>
                            <p className="text-gray-600">Bridging the gap between coordinators and field agents seamlessly.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
                            <div className="mx-auto w-16 h-16 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Reliability</h3>
                            <p className="text-gray-600">A robust platform you can count on, ensuring data is always available.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default About;
