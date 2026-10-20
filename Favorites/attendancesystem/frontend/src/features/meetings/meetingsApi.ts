import { baseApi } from '@/api/baseApi';
import type { Meeting, AttendanceRecord, PaginatedResponse } from '@/types';

interface CreateMeetingBody {
  org_id:             string;
  title:              string;
  scheduled_at:       string;   // full ISO datetime
  location?:          string;
  virtual_link?:      string;
  description?:       string;
  expected_attendees?: number;
}

export const meetingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getMeetings: build.query<PaginatedResponse<Meeting>, { org_id: string; search?: string; page?: number; limit?: number }>({
      query: ({ org_id, ...params }) => ({ url: `/orgs/${org_id}/meetings`, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(m => ({ type: 'Meeting' as const, id: m.id })), 'Meeting']
          : ['Meeting'],
    }),

    getMeeting: build.query<Meeting, string>({
      query: (id) => `/meetings/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Meeting', id }],
    }),

    createMeeting: build.mutation<Meeting, CreateMeetingBody>({
      query: ({ org_id, ...body }) => ({ url: `/orgs/${org_id}/meetings`, method: 'POST', body }),
      invalidatesTags: ['Meeting', 'Dashboard'],
    }),

    updateMeeting: build.mutation<Meeting, { id: string } & Partial<Omit<CreateMeetingBody, 'org_id'>>>({
      query: ({ id, ...body }) => ({ url: `/meetings/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Meeting', id }, 'Dashboard'],
    }),

    openAttendance: build.mutation<Meeting, string>({
      query: (id) => ({ url: `/meetings/${id}/open`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Meeting', id }, 'Dashboard'],
    }),

    closeAttendance: build.mutation<Meeting, string>({
      query: (id) => ({ url: `/meetings/${id}/close`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Meeting', id }, 'Dashboard'],
    }),

    getAttendanceRecords: build.query<PaginatedResponse<AttendanceRecord>, string>({
      query: (id) => `/meetings/${id}/attendance`,
      providesTags: ['Attendance'],
    }),

    deleteMeeting: build.mutation<void, string>({
      query: (id) => ({ url: `/meetings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Meeting', 'Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useOpenAttendanceMutation,
  useCloseAttendanceMutation,
  useGetAttendanceRecordsQuery,
  useDeleteMeetingMutation,
} = meetingsApi;
