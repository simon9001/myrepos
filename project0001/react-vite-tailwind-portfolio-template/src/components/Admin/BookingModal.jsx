import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, Link, AlertCircle } from 'lucide-react';
import { useUpdateBookingMutation } from '../../features/Api/adminApi';

const BookingModal = ({ isOpen, onClose, booking }) => {
    const [updateBooking, { isLoading }] = useUpdateBookingMutation();
    const [form, setForm] = useState({
        status: '',
        meeting_link: '',
        date: '',
        start_time: '',
        end_time: ''
    });
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (booking) {
            setForm({
                status: booking.status,
                meeting_link: booking.meeting_link || '',
                date: booking.date,
                start_time: booking.start_time,
                end_time: booking.end_time
            });
        }
    }, [booking]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateBooking({ id: booking.id, ...form }).unwrap();
            setStatus({ success: true, message: 'Booking updated!' });
            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 1000);
        } catch (err) {
            setStatus({ success: false, message: 'Update failed' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Booking</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Meeting Link</label>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={form.meeting_link}
                                onChange={e => setForm({ ...form, meeting_link: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 pl-10"
                                placeholder="https://meet.google.com/..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-gray-900 dark:text-white">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={e => setForm({ ...form, start_time: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-xs"
                            />
                        </div>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${status.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {status.message}
                        </div>
                    )}

                    <button
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Update Booking
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default BookingModal;
