import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Message sent successfully! We will get back to you soon.');
        e.target.reset();
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <main className="flex-grow">
            {/* Header */}
            <div className="bg-green-800 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Contact Us</h1>
                    <p className="text-xl text-green-100 max-w-2xl mx-auto">
                        Have questions about SmartSession? We'd love to hear from you.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                        <p className="text-lg text-gray-600 mb-10">
                            Whether you're looking to scale your agricultural operations or need technical support with our platform, our dedicated team is ready to assist you.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-700">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                                    <p className="mt-1 text-gray-500">support@smartsession.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-700">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                                    <p className="mt-1 text-gray-500">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 text-green-700">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-lg font-medium text-gray-900">Office</h3>
                                    <p className="mt-1 text-gray-500">123 Agriculture Way<br/>Tech Valley, CA 94000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
                        {status && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
                                {status}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" id="name" required className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-shadow" placeholder="John Doe" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" id="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-shadow" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input type="text" id="subject" required className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-shadow" placeholder="How can we help?" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea id="message" rows="4" required className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-shadow resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-green-800 hover:bg-green-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default Contact;
