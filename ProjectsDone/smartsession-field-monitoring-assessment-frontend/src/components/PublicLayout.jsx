import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router';

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Navbar />
            <div className="flex-grow flex flex-col">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default PublicLayout;
