import { baseApi } from '@/api/baseApi';
import type { UserWithMemberships, Organization } from '@/types';

interface AuthResponse {
  user:          UserWithMemberships;
  access_token:  string;
  refresh_token: string;
  token_type:    string;
  expires_in:    string;
}

interface RegisterOrgBody {
  // Company
  org_name:      string;
  industry:      string;
  country:       string;
  company_email: string;
  company_phone: string;
  address?:      string;
  website?:      string;
  // Admin
  first_name: string;
  last_name:  string;
  job_title:  string;
  email:      string;
  phone?:     string;
  password:   string;
  // Plan
  plan: 'free_trial' | 'basic' | 'professional' | 'enterprise';
}

interface RegisterOrgResponse extends AuthResponse {
  org: Organization;
}

interface InviteDetails {
  email:    string;
  org_name: string;
  org_logo: string | null;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    register: build.mutation<AuthResponse, {
      full_name: string;
      email:     string;
      password:  string;
      phone?:    string;
    }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    registerOrg: build.mutation<RegisterOrgResponse, RegisterOrgBody>({
      query: (body) => ({ url: '/auth/register-org', method: 'POST', body }),
    }),

    completeInvite: build.mutation<AuthResponse, {
      token:      string;
      first_name: string;
      last_name:  string;
      password:   string;
    }>({
      query: (body) => ({ url: '/auth/complete-invite', method: 'POST', body }),
    }),

    getInviteDetails: build.query<InviteDetails, string>({
      query: (token) => `/auth/invite-details/${token}`,
    }),

    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    logout: build.mutation<{ message: string }, { refresh_token?: string; all_devices?: boolean }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),

    getMe: build.query<UserWithMemberships, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    updateMe: build.mutation<UserWithMemberships, { full_name?: string; phone?: string | null }>({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      invalidatesTags: ['Auth'],
    }),

    changePassword: build.mutation<{ message: string }, {
      current_password: string;
      new_password:     string;
    }>({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),

    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: build.mutation<{ message: string }, {
      email:        string;
      code:         string;
      new_password: string;
    }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),

    verifyEmail: build.mutation<{ message: string }, { email: string; code: string }>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),

    resendVerification: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/resend-verification', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useRegisterOrgMutation,
  useCompleteInviteMutation,
  useGetInviteDetailsQuery,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;
