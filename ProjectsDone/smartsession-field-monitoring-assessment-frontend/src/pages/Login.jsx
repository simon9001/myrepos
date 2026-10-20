import React from 'react'
import SignIn from '../assets/login.svg'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { AuthApi } from '../features/api/AuthApi'
import { toast, Toaster } from 'sonner'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/slice/AuthSlice'



const Login = () => {

    //rtk query mutation hook for login
    const [loginUser, { isLoading }] = AuthApi.useLoginMutation();


    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle form submission
    const handleLoginForm = async(data) => {
        try {
            const response = await loginUser(data).unwrap();
            console.log('Login successful:', response);

            //dispatch the login success action to store the token and user info in Redux store
            dispatch(setCredentials({ token: response.token, user: response.userInfo }));
            if (response.userInfo.user_type === 'admin') {
                navigate('/admin/dashboard');
            } else if (response.userInfo.user_type === 'agent') {
                navigate('/agent/dashboard');
            } else {
                navigate('/');
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.data.error);
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex-grow bg-gray-50 flex items-center justify-center py-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl overflow-hidden w-full max-w-6xl shadow-xl">
                    {/* Image Section */}                    
                    <div className="hidden lg:flex items-center justify-center bg-green-50 p-4">
                        <img
                            src={SignIn}
                            alt="Login"
                            className="w-full max-w-96 rounded-2xl h-auto"
                        />
                    </div>
                    {/* Form Section */}
                    <div className="flex items-center justify-center p-8">
                        <div className="w-full max-w-96 bg-white rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-green-800 mb-2">
                                    Welcome Back
                                </h2>
                                <p className="text-gray-500 text-base">
                                    Sign in to your SmartSession account
                                </p>
                            </div>

                            <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleLoginForm)}>
                                {/* Email Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        {...register('email', { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })}
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Email address"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        {errors.email.message}
                                    </p>
                                )}

                                {/* Password Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="password"
                                    >
                                        Password
                                    </label>
                                    <input
                                        {...register('password', { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        {errors.password.message}
                                    </p>
                                )}

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <Link to="#" className="text-amber-600 no-underline text-sm hover:text-amber-700">
                                        Forgot your password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-green-800 hover:bg-green-900 text-white px-4 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 shadow-md hover:shadow-lg w-full"
                                >
                                    {isLoading ? <span className="loading loading-spinner text-warning"></span> : 'Sign In'}
                                </button>

                                <div className="flex flex-col gap-2 text-center mt-4">
                                    <Link to="/" className="text-green-800 no-underline flex items-center justify-center gap-1 text-sm hover:text-green-900">
                                        <span role="img" aria-label="home">🏡</span> Go to HomePage
                                    </Link>
                                    <Link to="/register" className="text-amber-600 no-underline flex items-center justify-center gap-1 text-sm hover:text-amber-700">
                                        Don't have an account? Register
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Login