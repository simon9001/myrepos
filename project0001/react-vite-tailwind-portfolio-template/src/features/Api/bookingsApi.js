import { apiSlice } from './apiSlice';

export const bookingsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createBooking: builder.mutation({
            query: (bookingData) => ({
                url: '/bookings',
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['Bookings'],
        }),
        getMyBookings: builder.query({
            query: () => '/bookings',
            providesTags: ['Bookings'],
        }),
        getSlots: builder.query({
            query: ({ date, service_id }) => ({
                url: '/bookings/slots',
                params: { date, service_id },
            }),
        }),
    }),
});

export const {
    useCreateBookingMutation,
    useGetMyBookingsQuery,
    useGetSlotsQuery
} = bookingsApi;


