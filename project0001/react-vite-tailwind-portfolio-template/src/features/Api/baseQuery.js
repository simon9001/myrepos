import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout } from '../Slice/AuthSlice'; // Adjust path if needed
import { apiDomain } from '../../apiDomain/apiDomain';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: apiDomain,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                // Try to get a new token
                // Use the refresh token from state
                // NOTE: The backend auth controller expects 'refreshToken' in the body
                // and returns { user, token }. 'token' being the access token. 
                // It's unclear if the backend supports refresh tokens fully as per the HouseRent logic I saw (HouseRent seemed to have it).
                // I will assume standard flow: post to /auth/refresh-token or similar.
                // Wait, the backend study showed `AuthController.login` returns a token (JWT) with 7d expiry. 
                // `AuthController` didn't explicitly show a refresh token endpoint in `auth.ts` routes during my study.
                // Let's re-read the backend `routes/auth.ts` and `index.ts`.
                // `authRoutes` had: register, login, getProfile. NO refresh-token endpoint!
                // The HouseRent frontend I saw had logic for refresh token, but maybe the backend I studied (`backendcode`) does NOT have it?
                // Let's assume for now 401 means logout, unless I can confirm a refresh endpoint. 
                // The HouseRent frontend `baseQuery.ts` referenced `auth/refresh-token`.
                // If the backend I'm connecting to is `backendcode`, and it DOES NOT have that endpoint, then I should just logout.
                // I will check `backendcode` `routes/auth.ts` again via memory or tool if needed.
                // My previous study of `backendcode` `routes/auth.ts` showed:
                // register, login, profile. THAT IS IT.
                // So the backend does NOT support refresh tokens yet.
                // I will simplify this: if 401, just logout. simpler.

                api.dispatch(logout());

            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }
    return result;
};
