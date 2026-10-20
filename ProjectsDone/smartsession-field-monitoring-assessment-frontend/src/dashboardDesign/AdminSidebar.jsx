import { BarChart, Sprout, Users, User } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router'

const AdminSidebar = () => {
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    const navigationItems = [
        {
            name: 'Overview',
            path: '/admin/dashboard',
            icon: <BarChart  />
        },
        {
            name: 'Manage Fields',
            path: '/admin/fields',
            icon: <Sprout  />
        }
    ]

    return (
        <div className="bg-white border-r border-gray-200 shadow-sm transition-all duration-300 w-64 min-h-screen fixed left-0 top-23 z-40">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold text-green-800">Coordinator Panel</h1>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                {navigationItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                ? 'bg-green-800 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-green-800'
                            }`}
                    >
                        <span className="shrink-0 mr-3">
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default AdminSidebar