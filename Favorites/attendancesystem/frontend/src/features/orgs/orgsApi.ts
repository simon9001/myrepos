import { baseApi } from '@/api/baseApi';
import type { Organization, Department, OrgMember, OrgMemberRole } from '@/types';

export const orgsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Organizations ─────────────────────────────────────────
    getMyOrgs: build.query<Organization[], void>({
      query: () => '/orgs',
      providesTags: ['Org'],
    }),

    getOrg: build.query<Organization, string>({
      query: (id) => `/orgs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Org', id }],
    }),

    createOrg: build.mutation<Organization, { name: string; slug: string }>({
      query: (body) => ({ url: '/orgs', method: 'POST', body }),
      invalidatesTags: ['Auth', 'Org'],
    }),

    acceptInvite: build.mutation<{ organization: Organization; role: OrgMemberRole }, { token: string }>({
      query: (body) => ({ url: '/auth/accept-invite', method: 'POST', body }),
      invalidatesTags: ['Auth', 'Org'],
    }),

    updateOrg: build.mutation<Organization, { id: string; name?: string; settings?: Record<string, unknown> }>({
      query: ({ id, ...body }) => ({ url: `/orgs/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Org', id }],
    }),

    // ── Departments ───────────────────────────────────────────
    getDepartments: build.query<Department[], string>({
      query: (orgId) => `/orgs/${orgId}/departments`,
      providesTags: ['Department'],
    }),

    createDepartment: build.mutation<Department, { orgId: string; name: string; description?: string }>({
      query: ({ orgId, ...body }) => ({ url: `/orgs/${orgId}/departments`, method: 'POST', body }),
      invalidatesTags: ['Department'],
    }),

    // ── Members ───────────────────────────────────────────────
    getMembers: build.query<OrgMember[], string>({
      query: (orgId) => `/orgs/${orgId}/members`,
      providesTags: ['Member'],
    }),

    inviteMember: build.mutation<OrgMember, {
      orgId:   string;
      email:   string;
      role:    string;
      name?:   string;
    }>({
      query: ({ orgId, ...body }) => ({ url: `/orgs/${orgId}/members/invite`, method: 'POST', body }),
      invalidatesTags: ['Member'],
    }),

    updateMemberRole: build.mutation<OrgMember, { orgId: string; memberId: string; role: string }>({
      query: ({ orgId, memberId, role }) => ({
        url: `/orgs/${orgId}/members/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Member'],
    }),

    removeMember: build.mutation<void, { orgId: string; memberId: string }>({
      query: ({ orgId, memberId }) => ({ url: `/orgs/${orgId}/members/${memberId}`, method: 'DELETE' }),
      invalidatesTags: ['Member'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyOrgsQuery,
  useGetOrgQuery,
  useCreateOrgMutation,
  useAcceptInviteMutation,
  useUpdateOrgMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = orgsApi;
