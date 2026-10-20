import React from 'react';
import { Link } from 'react-router';
import { Sprout, Map, Activity } from 'lucide-react';

const Home = () => {
    return (
        <main className="flex-grow">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Smarter tracking for</span>{' '}
                                    <span className="block text-green-700 xl:inline">modern agriculture</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Monitor crop lifecycles, assign field agents, and track harvest readiness in real-time. The ultimate platform to manage your growing season from planting to harvest.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/login"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 transition-colors md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full opacity-90"
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
                        alt="Agricultural fields"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:via-white/20"></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-green-700 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage fields
                        </p>
                    </div>

                    <div className="mt-16">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-700">
                                        <Sprout className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Crop Lifecycles</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Track every stage of development from planting, to growing, to harvest ready.
                                </dd>
                            </div>

                            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-700">
                                        <Map className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Agent Assignment</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Assign specific fields to field agents for focused monitoring and localized updates.
                                </dd>
                            </div>

                            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-yellow-100 text-yellow-700">
                                        <Activity className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Risk Assessment</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Automatically identify neglected fields to ensure nothing falls through the cracks.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Home;
