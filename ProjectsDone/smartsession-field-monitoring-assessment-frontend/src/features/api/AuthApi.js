import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/ApiDomain';

// Mock User Data
const MOCK_USERS = [
    {
        user_id: 1,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@crop.com',
        user_type: 'admin',
        password: 'password123'
    },
    {
        user_id: 2,
        first_name: 'Field',
        last_name: 'Agent',
        email: 'agent@crop.com',
        user_type: 'agent',
        password: 'password123'
    }
];

export const AuthApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Dummy base url
    endpoints: (builder) => ({
        // User Login
        login: builder.mutation({
            queryFn: (credentials) => {
                const user = MOCK_USERS.find(u => u.email === credentials.email && u.password === credentials.password);
                if (user) {
                    const { password, ...userInfo } = user;
                    return { data: { token: 'mock-jwt-token-123', userInfo } };
                }
                return { error: { status: 401, data: { error: 'Invalid email or password' } } };
            },
        }),
        // User Registration (Mock)
        register: builder.mutation({  
            queryFn: (userInfo) => {
                // Just mock success for now
                return { data: { message: 'Registration successful. Please login.' } };
            },
        }),
    }),
})