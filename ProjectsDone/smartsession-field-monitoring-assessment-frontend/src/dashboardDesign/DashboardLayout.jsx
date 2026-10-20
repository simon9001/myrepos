import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from './Sidebar'
import Footer from '../components/Footer'



const DashboardLayout = ({ children }) => {



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout Container */}
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 transition-all duration-300  ml-64" >
                    <div className="p-6 min-h-screen">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer positioned at bottom */}
            <div className="transition-all duration-300 ml-64" >
                <Footer />
            </div>
        </div>
    )
}

export default DashboardLayout