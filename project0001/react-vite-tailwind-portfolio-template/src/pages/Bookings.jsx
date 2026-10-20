import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateBookingMutation, useGetSlotsQuery } from '../features/Api/bookingsApi';
import { useGetPublicServicesQuery } from '../features/Api/publicApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const bookingSchema = z.object({
    service_id: z.string().uuid('Please select a service'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is required'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Please select a time slot'),
    user_notes: z.string().optional(),
    payment_phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, 'Enter a valid M-Pesa number (e.g., 0712345678)'),
});

const Bookings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedServiceId = searchParams.get('serviceId');

    const [createBooking, { isLoading: isBooking, isSuccess, error: bookingError }] = useCreateBookingMutation();
    const { data: servicesData, isLoading: servicesLoading } = useGetPublicServicesQuery({});

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            service_id: preSelectedServiceId || '',
            date: '',
            start_time: '',
            user_notes: ''
        }
    });

    const selectedServiceId = watch('service_id');
    const selectedDate = watch('date');
    const selectedTime = watch('start_time');

    // Fetch available slots
    const { data: slotsData, isLoading: slotsLoading, isFetching: slotsFetching } = useGetSlotsQuery(
        { date: selectedDate, service_id: selectedServiceId },
        { skip: !selectedDate || !selectedServiceId }
    );

    const availableSlots = slotsData?.slots || [];

    const onSubmit = async (data) => {
        try {
            await createBooking(data).unwrap();
            reset();
        } catch (err) {
            console.error('Booking failed:', err);
        }
    };

    if (servicesLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"
                >
                    <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check Your Phone!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    An M-Pesa payment request has been sent to your phone.
                    Please <strong>enter your M-Pesa PIN</strong> to complete the booking.
                    Your booking will be confirmed automatically once payment is received.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200"
                >
                    View Status in Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
                <div className="bg-green-600 px-8 py-8 text-white">
                    <h1 className="text-3xl font-bold">Book your Consultation</h1>
                    <p className="text-green-100 mt-2">Choose a service and pick a time that works for you.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Service Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    1. Select Service
                                </label>
                                <select
                                    {...register('service_id')}
                                    className="w-full rounded-xl border-gray-200 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                >
                                    <option value="">-- Choose a Service --</option>
                                    {servicesData?.services?.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name} ({service.duration_mins} mins) - Ksh {service.price}
                                        </option>
                                    ))}
                                </select>
                                {errors.service_id && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.service_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    2. Pick a Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        {...register('date')}
                                        onChange={(e) => {
                                            register('date').onChange(e);
                                            setValue('start_time', ''); // Reset time when date changes
                                        }}
                                        className="w-full pl-12 rounded-xl border-gray-200 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                {errors.date && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.date.message}
                                    </p>
                                )}
                            </div>

                            {/* M-Pesa Phone Number */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    3. M-Pesa Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        {...register('payment_phone')}
                                        placeholder="e.g., 0712345678"
                                        className="w-full pl-12 rounded-xl border-gray-200 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                                    />
                                </div>
                                {errors.payment_phone && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.payment_phone.message}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">This number will receive the M-Pesa STK Push.</p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    4. Additional Notes (Optional)
                                </label>
                                <textarea
                                    {...register('user_notes')}
                                    rows={3}
                                    className="w-full rounded-xl border-gray-200 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all resize-none"
                                    placeholder="Tell us about your farm or specific needs..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Slot Selection */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-600" /> 5. Select Start Time
                            </label>

                            {!selectedDate || !selectedServiceId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 italic">
                                    <Calendar className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Select a service and date to view available time slots.</p>
                                </div>
                            ) : slotsLoading || slotsFetching ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                                    <p className="text-sm text-gray-500">Checking availability...</p>
                                </div>
                            ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.time}
                                            type="button"
                                            disabled={!slot.available}
                                            onClick={() => setValue('start_time', slot.time)}
                                            className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${selectedTime === slot.time
                                                ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-600 ring-offset-2'
                                                : slot.available
                                                    ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-600'
                                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-400 border-transparent cursor-not-allowed line-through'
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 text-red-500">
                                    <p>No available slots for the selected date. Please try another day.</p>
                                </div>
                            )}

                            {errors.start_time && (
                                <p className="text-red-500 text-sm mt-4 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.start_time.message}
                                </p>
                            )}
                        </div>

                        {/* Booking Error */}
                        {bookingError && (
                            <div className="md:col-span-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{bookingError?.data?.error || 'Unable to complete booking. Please verify details and try again.'}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={isBooking || !selectedTime}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-green-100"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Confirming Booking...
                                    </>
                                ) : (
                                    'Complete Booking'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Bookings;
