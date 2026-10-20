import { baseApi } from '@/api/baseApi';
import type { MeetingStatus } from '@/types';

export interface AttendContext {
  meeting: {
    id:       string;
    title:    string;
    status:   MeetingStatus;
    location: string | null;
  };
  org_name?:      string;
  require_otp?:   boolean;
  require_photo?: boolean;
  require_gps?:   boolean;
}

export interface SubmitAttendanceBody {
  token:           string;         // invitation token from URL
  full_name:       string;
  email:           string;
  phone?:          string;
  department_name?: string;
  designation?:    string;
  signature_data:  string;         // base64 PNG data URL
  photo_data?:     string;
  otp_code?:       string;
  gps_lat?:        number;
  gps_lng?:        number;
  signature_method?: 'finger' | 'mouse' | 'stylus';
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getInviteContext: build.query<AttendContext, string>({
      query: (token) => `/attend/invite/${token}`,
    }),

    getQrContext: build.query<AttendContext, string>({
      query: (code) => `/attend/qr/${code}`,
    }),

    submitAttendance: build.mutation<{ message: string; record_id: string }, SubmitAttendanceBody>({
      query: ({ token, ...body }) => ({
        url:    `/attend/submit`,
        method: 'POST',
        body:   { invitation_token: token, signature_method: 'mouse', ...body },
      }),
    }),

    requestOtp: build.mutation<{ message: string }, { email: string; token: string }>({
      query: ({ token, ...body }) => ({
        url:    '/attend/otp/request',
        method: 'POST',
        body:   { ...body, invitation_token: token },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInviteContextQuery,
  useGetQrContextQuery,
  useSubmitAttendanceMutation,
  useRequestOtpMutation,
} = attendanceApi;
