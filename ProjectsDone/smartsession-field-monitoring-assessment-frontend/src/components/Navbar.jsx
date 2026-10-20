import React from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../features/slice/AuthSlice';
import { ChevronDown, LogOut, Cloud } from 'lucide-react';

const Navbar = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    //get the auth state from redux store to conditionally render login/register or user profile/logout
    const { isAuthenticated, user } = useSelector((state) => state.authSlice);

    const handleLogout = () => {
        dispatch(clearCredentials());
        navigate("/login");
    };

    return (
        <div className="navbar bg-white shadow-md sticky top-0 z-50 py-4 px-4 sm:px-8">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden pr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-white rounded-xl z-10 mt-3 w-56 p-3 shadow-xl border border-gray-100 gap-1">
                        <li><Link to="/" className="text-gray-700 hover:text-green-800 hover:bg-green-50 font-medium py-2">Home</Link></li>
                        <li><Link to="/about" className="text-gray-700 hover:text-green-800 hover:bg-green-50 font-medium py-2">About Us</Link></li>
                        <li><Link to="/contact" className="text-gray-700 hover:text-green-800 hover:bg-green-50 font-medium py-2">Contact Us</Link></li>

                        {isAuthenticated && user?.user_type === 'admin' && (
                            <li><Link to="/admin/dashboard" className="text-green-700 hover:bg-green-50 font-medium py-2">Dashboard</Link></li>
                        )}
                        {isAuthenticated && user?.user_type === 'agent' && (
                            <li><Link to="/agent/dashboard" className="text-green-700 hover:bg-green-50 font-medium py-2">Dashboard</Link></li>
                        )}

                        {!isAuthenticated && (
                            <>
                                <div className="divider my-1"></div>
                                <li><Link to="/login" className="text-gray-700 hover:text-green-800 hover:bg-green-50 font-medium py-2">Login</Link></li>
                                <li><Link to="/register" className="text-white bg-green-800 hover:bg-green-900 font-medium py-2 mt-1 flex justify-center text-center rounded-lg">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-green-800 text-white p-1.5 rounded-lg hidden sm:block">
                        <Cloud className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">SmartSession</span>
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="flex space-x-8 px-1">
                    <li><Link to="/" className="text-gray-600 hover:text-green-800 font-medium transition-colors">Home</Link></li>
                    <li><Link to="/about" className="text-gray-600 hover:text-green-800 font-medium transition-colors">About Us</Link></li>
                    <li><Link to="/contact" className="text-gray-600 hover:text-green-800 font-medium transition-colors">Contact Us</Link></li>

                    {isAuthenticated && user?.user_type === 'admin' && (
                        <li><Link to="/admin/dashboard" className="text-green-700 hover:text-green-800 font-bold transition-colors">Dashboard</Link></li>
                    )}
                    {isAuthenticated && user?.user_type === 'agent' && (
                        <li><Link to="/agent/dashboard" className="text-green-700 hover:text-green-800 font-bold transition-colors">Dashboard</Link></li>
                    )}
                </ul>
            </div>

            <div className="navbar-end gap-3">
                {!isAuthenticated ? (
                    <div className="hidden sm:flex items-center gap-3">
                        <Link to="/login" className="text-gray-700 hover:text-green-800 font-medium px-4 py-2 transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="btn bg-green-800 hover:bg-green-900 text-white border-none px-6 py-2 rounded-lg font-medium shadow-md transition-all hover:shadow-lg">
                            Register
                        </Link>
                    </div>
                ) : (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                                {(user?.first_name?.[0] || user?.last_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <span className="text-gray-700 font-medium hidden sm:block">
                                {user?.first_name || user?.last_name || 'User'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content bg-white rounded-xl z-[1] mt-3 w-52 p-2 shadow-xl border border-gray-100">
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-lg transition-colors font-medium"
                                >
                                    <LogOut className='w-4 h-4 mr-3' />
                                    Sign out
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
