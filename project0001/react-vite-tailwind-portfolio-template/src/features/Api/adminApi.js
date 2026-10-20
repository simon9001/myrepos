import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ... (Dashboard)
        getDashboardStats: builder.query({
            query: () => '/admin/dashboard/stats',
            providesTags: ['Dashboard'],
        }),

        // ... (Users)
        getAllUsers: builder.query({
            query: ({ limit = 50, offset = 0 } = {}) => ({
                url: '/admin/users',
                params: { limit, offset },
            }),
            providesTags: ['Users'],
        }),

        getUserDetails: builder.query({
            query: (id) => `/admin/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),

        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/admin/users/${id}/role`,
                method: 'PATCH',
                body: { role },
            }),
            invalidatesTags: ['Users'],
        }),

        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users', 'Dashboard'],
        }),

        // ... (Services)
        createService: builder.mutation({
            query: (service) => ({
                url: '/admin/services',
                method: 'POST',
                body: service,
            }),
            invalidatesTags: ['Services', 'Dashboard'],
        }),

        updateService: builder.mutation({
            query: ({ id, ...service }) => ({
                url: `/admin/services/${id}`,
                method: 'PATCH',
                body: service,
            }),
            invalidatesTags: ['Services', 'Dashboard'],
        }),

        deleteService: builder.mutation({
            query: (id) => ({
                url: `/admin/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Services', 'Dashboard'],
        }),

        // ... (Crops)
        createCrop: builder.mutation({
            query: (crop) => ({
                url: '/admin/crops',
                method: 'POST',
                body: crop,
            }),
            invalidatesTags: ['Crops', 'Dashboard'],
        }),

        updateCrop: builder.mutation({
            query: ({ id, ...crop }) => ({
                url: `/admin/crops/${id}`,
                method: 'PATCH',
                body: crop,
            }),
            invalidatesTags: ['Crops', 'Dashboard'],
        }),

        deleteCrop: builder.mutation({
            query: (id) => ({
                url: `/admin/crops/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Crops', 'Dashboard'],
        }),

        // ... (Projects)
        createProject: builder.mutation({
            query: (project) => ({
                url: '/admin/projects',
                method: 'POST',
                body: project,
            }),
            invalidatesTags: ['Projects', 'Dashboard'],
        }),

        updateProject: builder.mutation({
            query: ({ id, ...project }) => ({
                url: `/admin/projects/${id}`,
                method: 'PATCH',
                body: project,
            }),
            invalidatesTags: ['Projects', 'Dashboard'],
        }),

        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/admin/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Projects', 'Dashboard'],
        }),

        // ... (Bookings)
        getAllBookings: builder.query({
            query: (params) => ({
                url: '/admin/bookings',
                params,
            }),
            providesTags: ['Bookings', 'Dashboard'],
        }),

        updateBooking: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/bookings/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Bookings', 'Dashboard'],
        }),
        // Tips management
        createTip: builder.mutation({
            query: (tip) => ({
                url: '/admin/tips',
                method: 'POST',
                body: tip,
            }),
            invalidatesTags: ['Tips'],
        }),

        updateTip: builder.mutation({
            query: ({ id, ...tip }) => ({
                url: `/admin/tips/${id}`,
                method: 'PATCH',
                body: tip,
            }),
            invalidatesTags: ['Tips'],
        }),

        deleteTip: builder.mutation({
            query: (id) => ({
                url: `/admin/tips/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Tips'],
        }),

        // Settings
        getSettings: builder.query({
            query: () => '/admin/settings',
        }),

        updateSettings: builder.mutation({
            query: (settings) => ({
                url: '/admin/settings',
                method: 'PATCH',
                body: settings,
            }),
        }),

        // Export data
        exportData: builder.query({
            query: (type) => ({
                url: '/admin/export',
                params: { type },
            }),
        }),

        // Testimonials
        approveTestimonial: builder.mutation({
            query: (id) => ({
                url: `/admin/testimonials/${id}/approve`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Dashboard'],
        }),

        deleteTestimonial: builder.mutation({
            query: (id) => ({
                url: `/admin/testimonials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Dashboard'],
        }),

        // Media
        uploadMedia: builder.mutation({
            query: (formData) => ({
                url: '/media/upload',
                method: 'POST',
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetAllUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
    useUploadMediaMutation,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useCreateCropMutation,
    useUpdateCropMutation,
    useDeleteCropMutation,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useGetAllBookingsQuery,
    useUpdateBookingMutation,
    useCreateTipMutation,
    useUpdateTipMutation,
    useDeleteTipMutation,
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useLazyExportDataQuery,
    useApproveTestimonialMutation,
    useDeleteTestimonialMutation,
} = adminApi;

