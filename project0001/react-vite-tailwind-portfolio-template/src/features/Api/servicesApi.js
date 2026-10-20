import { apiSlice } from './apiSlice';

export const servicesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getServices: builder.query({
            query: () => '/services',
            providesTags: ['Services'],
        }),
    }),
});

export const { useGetServicesQuery } = servicesApi;

