import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserWithMemberships } from '@/types';

// ── Local-storage persistence helpers ────────────────────────────────────────

const LS = {
  get: (key: string) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, val: string) => {
    try { localStorage.setItem(key, val); } catch { /* noop */ }
  },
  del: (key: string) => {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

const KEYS = {
  user:    'at_user',
  access:  'at_access',
  refresh: 'at_refresh',
  org:     'at_org',
};

// ── State ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  user:          UserWithMemberships | null;
  accessToken:   string | null;
  refreshToken:  string | null;
  activeOrgId:   string | null;
}

const loadPersistedState = (): AuthState => ({
  user:         JSON.parse(LS.get(KEYS.user)   ?? 'null'),
  accessToken:  LS.get(KEYS.access),
  refreshToken: LS.get(KEYS.refresh),
  activeOrgId:  LS.get(KEYS.org),
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: loadPersistedState,

  reducers: {
    credentialsSet(
      state,
      action: PayloadAction<{
        user:          UserWithMemberships;
        access_token:  string;
        refresh_token: string;
      }>,
    ) {
      const { user, access_token, refresh_token } = action.payload;
      state.user         = user;
      state.accessToken  = access_token;
      state.refreshToken = refresh_token;

      // Auto-select first org membership on login
      if (!state.activeOrgId && user.memberships?.length) {
        state.activeOrgId = user.memberships[0].organization.id;
        LS.set(KEYS.org, state.activeOrgId);
      }

      LS.set(KEYS.user,    JSON.stringify(user));
      LS.set(KEYS.access,  access_token);
      LS.set(KEYS.refresh, refresh_token);
    },

    tokenRefreshed(
      state,
      action: PayloadAction<{ access_token: string; refresh_token: string }>,
    ) {
      state.accessToken  = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      LS.set(KEYS.access,  action.payload.access_token);
      LS.set(KEYS.refresh, action.payload.refresh_token);
    },

    userUpdated(state, action: PayloadAction<Partial<UserWithMemberships>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        LS.set(KEYS.user, JSON.stringify(state.user));
      }
    },

    activeOrgChanged(state, action: PayloadAction<string>) {
      state.activeOrgId = action.payload;
      LS.set(KEYS.org, action.payload);
    },

    logout(state) {
      state.user         = null;
      state.accessToken  = null;
      state.refreshToken = null;
      state.activeOrgId  = null;
      LS.del(KEYS.user);
      LS.del(KEYS.access);
      LS.del(KEYS.refresh);
      LS.del(KEYS.org);
    },
  },
});

export const {
  credentialsSet,
  tokenRefreshed,
  userUpdated,
  activeOrgChanged,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCurrentUser   = (s: { auth: AuthState }) => s.auth.user;
export const selectAccessToken   = (s: { auth: AuthState }) => s.auth.accessToken;
export const selectActiveOrgId   = (s: { auth: AuthState }) => s.auth.activeOrgId;
export const selectIsLoggedIn    = (s: { auth: AuthState }) => Boolean(s.auth.accessToken);
export const selectEmailVerified  = (s: { auth: AuthState }) => s.auth.user?.email_verified ?? false;
export const selectHasMemberships = (s: { auth: AuthState }) => (s.auth.user?.memberships?.length ?? 0) > 0;
export const selectActiveMembership = (s: { auth: AuthState }) =>
  s.auth.user?.memberships?.find(m => m.organization.id === s.auth.activeOrgId) ?? null;
