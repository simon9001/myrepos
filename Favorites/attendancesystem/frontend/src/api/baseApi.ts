import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '@/app/store';
import { API_BASE_URL } from '@/config/api';
import { logout, tokenRefreshed } from '@/features/auth/authSlice';

// ── Base query (attaches Bearer token) ───────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// ── Reauth wrapper (auto-refresh on 401) ─────────────────────────────────────

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refresh = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refresh_token: refreshToken } },
        api,
        extraOptions,
      );

      if (refresh.data) {
        const { access_token, refresh_token } = refresh.data as {
          access_token: string;
          refresh_token: string;
        };
        api.dispatch(tokenRefreshed({ access_token, refresh_token }));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

// ── Base API ─────────────────────────────────────────────────────────────────
// All feature APIs extend this via injectEndpoints()

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery:   baseQueryWithReauth,
  tagTypes: [
    'Auth', 'Org', 'Department', 'Member',
    'Meeting', 'TrainingEvent', 'TrainingSession',
    'Attendance', 'Template', 'QrCode', 'Document',
    'Notification', 'Dashboard',
  ],
  endpoints: () => ({}),
});
