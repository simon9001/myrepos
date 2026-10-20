import React from 'react'
import SignUp from '../assets/sign-up.svg'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { AuthApi } from '../features/api/AuthApi'
import {Toaster,toast} from 'sonner'
// import { useDispatch } from 'react-redux'





const Register = () => {

    //RTK Query mutation hook for registration 
    const [registerUser, { isLoading}] = AuthApi.useRegisterMutation();

    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmitForm = async(data) => {
        try {
            const response = await registerUser(data).unwrap();
            console.log('Registration successful:', response);
            // toast.success(response.message);
            
            //navigate to login page after successful registration
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.data.error);
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex-grow bg-gray-50 flex items-center justify-center py-4 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl overflow-hidden w-full max-w-6xl shadow-xl">
                    {/* Form Section */}
                    <div className="flex items-center justify-center p-8">
                        <div className="w-full max-w-96 bg-white rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-green-800 mb-1">
                                    Join SmartSession
                                </h2>
                                <p className="text-gray-500 text-base">
                                    Create your account
                                </p>
                            </div>
                            {/* {error && (
                                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">
                                    {String((error as any)?.data?.error ?? (error instanceof Error ? error.message : 'Registration failed. Please try again.'))}
                                </div>
                            )} */}
                            <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleSubmitForm)}>
                                {/* First Row - First Name & Last Name */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1.5"
                                            htmlFor="first_name"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            {...register('first_name', { required: "First name is required", minLength: { value: 2, message: "First name must be at least 2 characters" } })}
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            placeholder="First Name"
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-100"
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                {errors.first_name.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-1.5"
                                            htmlFor="last_name"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            {...register('last_name', { required: "Last name is required", minLength: { value: 2, message: "Last name must be at least 2 characters" } })}
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Last Name"
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-100"

                                        />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            {errors.last_name.message}
                                        </p>
                                    )}
                                    </div>
                                </div>

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

                                {/* Phone Number Field */}
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                        htmlFor="phone_number"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        {...register('phone_number', { required: "Phone number is required", pattern: { value: /^[0-9]{10,15}$/, message: "Invalid phone number" } })}
                                        type="tel"
                                        id="phone_number"
                                        name="phone_number"
                                        placeholder="Phone Number"
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-transparent transition-all duration-300 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>
                                {errors.phone_number && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        {errors.phone_number.message}
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

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-green-800 hover:bg-green-900 text-white px-4 py-4 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 shadow-md hover:shadow-lg w-full"
                                >
                                    {isLoading ? <span className="loading loading-spinner text-warning"></span> : 'Create Account'}
                                </button>

                                <div className="flex flex-col gap-2 text-center mt-4">
                                    <Link to="/" className="text-green-800 no-underline flex items-center justify-center gap-1 text-sm hover:text-green-900">
                                        <span role="img" aria-label="home">🏡</span> Go to HomePage
                                    </Link>
                                    <Link to="/login" className="text-amber-600 no-underline flex items-center justify-center gap-1 text-sm hover:text-amber-700">
                                        Already have an account? Login
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                    {/* Image Section */}
                    <div className="flex items-center justify-center bg-blue-50 p-8">
                        <img
                            src={SignUp}
                            alt="Register"
                            className="w-full max-w-96 rounded-2xl h-auto"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register