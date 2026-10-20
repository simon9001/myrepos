import React from 'react'
import { Link } from 'react-router'
import { Cloud } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="footer sm:footer-horizontal bg-white border-t border-gray-200 text-gray-700 p-10 font-sans">
            <aside className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-800 text-white p-1.5 rounded-lg">
                        <Cloud className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">SmartSession</span>
                </div>
                <p className="text-sm text-gray-500 max-w-xs">
                    SmartSession Field Monitoring.
                    <br />
                    Intelligent tracking for modern agriculture from planting to harvest.
                </p>
            </aside>
            <nav>
                <h6 className="footer-title text-gray-900 opacity-100 font-bold mb-2">Platform</h6>
                <Link to="/login" className="link link-hover text-gray-600 hover:text-green-800">Agent Login</Link>
                <Link to="/login" className="link link-hover text-gray-600 hover:text-green-800">Coordinator Login</Link>
                <Link to="/register" className="link link-hover text-gray-600 hover:text-green-800">Create Account</Link>
            </nav>
            <nav>
                <h6 className="footer-title text-gray-900 opacity-100 font-bold mb-2">Company</h6>
                <Link to="/about" className="link link-hover text-gray-600 hover:text-green-800">About us</Link>
                <Link to="/contact" className="link link-hover text-gray-600 hover:text-green-800">Contact</Link>
                <Link to="/" className="link link-hover text-gray-600 hover:text-green-800">Home</Link>
            </nav>
            <nav>
                <h6 className="footer-title text-gray-900 opacity-100 font-bold mb-2">Legal</h6>
                <a className="link link-hover text-gray-600 hover:text-green-800">Terms of use</a>
                <a className="link link-hover text-gray-600 hover:text-green-800">Privacy policy</a>
                <a className="link link-hover text-gray-600 hover:text-green-800">Cookie policy</a>
            </nav>
        </footer>
    )
}

export default Footer