import { baseApi } from '@/api/baseApi';
import type { DashboardStats } from '@/types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getDashboardStats: build.query<DashboardStats, string>({
      query: (orgId) => `/orgs/${orgId}/dashboard`,
      providesTags: ['Dashboard'],
    }),

    getDashboardByDept: build.query<unknown, string>({
      query: (orgId) => `/orgs/${orgId}/dashboard/by-department`,
      providesTags: ['Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardByDeptQuery,
} = dashboardApi;
