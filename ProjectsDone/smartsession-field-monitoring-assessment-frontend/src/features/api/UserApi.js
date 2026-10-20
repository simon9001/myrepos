import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';

const MOCK_USERS = [
    {
        user_id: 1,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@crop.com',
        user_type: 'admin'
    },
    {
        user_id: 2,
        first_name: 'Field',
        last_name: 'Agent',
        email: 'agent@crop.com',
        user_type: 'agent'
    }
];

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        // Fetch all Users
        getAllUsers: builder.query({
            queryFn: () => {
                return { data: MOCK_USERS };
            },
            providesTags: ['Users'],
        }),        
        // get user by id
        getUserById: builder.query({
            queryFn: (user_id) => {
                const user = MOCK_USERS.find(u => u.user_id === parseInt(user_id));
                return user ? { data: user } : { error: { status: 404, data: 'User not found' } };
            },
            providesTags: ['Users'],
        })
    }),
});
                                                                                                                                                                                                                                                                                                        