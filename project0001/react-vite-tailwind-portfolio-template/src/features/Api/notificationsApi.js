import { apiSlice } from './apiSlice';

export const notificationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get user's notifications
        getUserNotifications: builder.query({
            query: ({ unread_only, limit = 50, offset = 0 } = {}) => ({
                url: '/notifications',
                params: { unread_only, limit, offset },
            }),
            providesTags: ['Notifications'],
        }),

        // Mark a notification as read
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // Mark all notifications as read
        markAllAsRead: builder.mutation({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // Send notification (admin only)
        sendNotification: builder.mutation({
            query: ({ user_id, type, message }) => ({
                url: '/notifications/send',
                method: 'POST',
                body: { user_id, type, message },
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
});

export const {
    useGetUserNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useSendNotificationMutation,
} = notificationsApi;

