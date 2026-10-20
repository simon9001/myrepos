import React from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRegisterMutation } from '../features/Api/authApi';
import { setCredentials, selectIsAuthenticated } from '../features/Slice/AuthSlice';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    password: z.string().min(6, 'Password at least 6 characters'),
    role: z.enum(['farmer', 'sponsor', 'buyer', 'admin']).default('farmer'),
});

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const defaultRole = ['farmer', 'sponsor', 'buyer', 'admin'].includes(roleParam) ? roleParam : 'farmer';

    const [registerUser, { isLoading, error }] = useRegisterMutation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: defaultRole
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        try {
            const result = await registerUser(data).unwrap();
            dispatch(setCredentials({ ...result, isAuthenticated: true }));

            // Redirect based on role
            if (result.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-900 border border-green-100 dark:border-green-900"
            >
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {roleParam === 'sponsor' ? 'Sponsor Application' : 'Join Farm with Irene'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {roleParam === 'sponsor'
                            ? 'Collaborate with us to empower smallholder farmers.'
                            : 'Start your farming journey today'}
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input
                                {...register('name')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Jane Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="jane@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input
                                {...register('phone')}
                                type="tel"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="+254..."
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Register as</label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'farmer', label: 'Farmer' },
                                    { id: 'sponsor', label: 'Sponsor' },
                                    { id: 'buyer', label: 'Buyer/Hotel' }
                                ].map((role) => (
                                    <label
                                        key={role.id}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedRole === role.id
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('role')}
                                            value={role.id}
                                            className="sr-only"
                                        />
                                        <span className="text-xs font-bold">{role.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-center text-sm">
                            {error.data?.error || 'Registration failed.'}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-green-600 hover:text-green-500">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
