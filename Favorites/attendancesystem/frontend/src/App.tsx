import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import {
  selectAccessToken,
  selectCurrentUser,
  selectActiveOrgId,
  selectActiveMembership,
} from './features/auth/authSlice';

import { AppLayout }          from './components/layout/AppLayout';
import { LoginPage }          from './pages/auth/LoginPage';
import { RegisterPage }       from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage }    from './pages/auth/VerifyEmailPage';
import { DashboardPage }      from './pages/DashboardPage';
import { MeetingsPage }       from './pages/meetings/MeetingsPage';
import { MeetingDetailPage }  from './pages/meetings/MeetingDetailPage';
import { MembersPage }        from './pages/MembersPage';
import { SettingsPage }       from './pages/SettingsPage';
import { TrainingPage }       from './pages/TrainingPage';
import { TemplatesPage }      from './pages/TemplatesPage';
import { QrPage }             from './pages/QrPage';
import { DocumentsPage }      from './pages/DocumentsPage';
import { AttendPage }         from './pages/attendance/AttendPage';
import { OnboardingPage }     from './pages/OnboardingPage';
import { JoinPage }           from './pages/JoinPage';
import { SetupWizardPage }    from './pages/SetupWizardPage';
import { NotFoundPage }       from './pages/NotFoundPage';

// ── Route guards ──────────────────────────────────────────────────────────────

// Redirect logged-in users away from guest-only pages (login / register).
function GuestRoute({ children }: { children: ReactNode }) {
  const token = useAppSelector(selectAccessToken);
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Requires login + verified email, but does NOT require an org membership.
// Used for onboarding so users without orgs aren't looped.
// JoinPage is intentionally outside this guard so guests can access it too.
function OnboardingRoute({ children }: { children: ReactNode }) {
  const token    = useAppSelector(selectAccessToken);
  const user     = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !user.email_verified) return <Navigate to="/verify-email" replace />;
  // Already has an org — skip onboarding
  if (user?.memberships?.length) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Setup wizard: login + verified + org + wizard is 'pending' + role is super_admin.
function SetupRoute({ children }: { children: ReactNode }) {
  const token            = useAppSelector(selectAccessToken);
  const user             = useAppSelector(selectCurrentUser);
  const activeOrgId      = useAppSelector(selectActiveOrgId);
  const activeMembership = useAppSelector(selectActiveMembership);
  const location         = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !user.email_verified) return <Navigate to="/verify-email" replace />;
  if (!user?.memberships?.length) return <Navigate to="/onboarding" replace />;

  const setupPending =
    activeOrgId &&
    localStorage.getItem(`at_setup_${activeOrgId}`) === 'pending' &&
    activeMembership?.role === 'super_admin';

  if (!setupPending) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Requires login + verified email + at least one org membership.
// Redirects super_admin to setup wizard if setup is still pending.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token            = useAppSelector(selectAccessToken);
  const user             = useAppSelector(selectCurrentUser);
  const activeOrgId      = useAppSelector(selectActiveOrgId);
  const activeMembership = useAppSelector(selectActiveMembership);
  const location         = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !user.email_verified) return <Navigate to="/verify-email" replace />;
  if (user && user.email_verified && !user.memberships?.length) {
    return <Navigate to="/onboarding" replace />;
  }

  // Super admin who hasn't completed the setup wizard → redirect to /setup
  const setupPending =
    activeOrgId &&
    localStorage.getItem(`at_setup_${activeOrgId}`) === 'pending' &&
    activeMembership?.role === 'super_admin';

  if (setupPending) return <Navigate to="/setup" replace />;

  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Fully public */}
        <Route path="/attend/:token" element={<AttendPage />} />

        {/* Semi-public — email can come from store or navigation state */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Public join page — handles both guests (account creation) and logged-in users */}
        <Route path="/join/:token" element={<JoinPage />} />

        {/* Guest-only auth pages */}
        <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

        {/* Onboarding: login + verified, no org required */}
        <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

        {/* Setup wizard: login + verified + org + pending wizard */}
        <Route path="/setup" element={<SetupRoute><SetupWizardPage /></SetupRoute>} />

        {/* App shell: login + verified + org required */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index               element={<DashboardPage />} />
          <Route path="meetings"     element={<MeetingsPage />} />
          <Route path="meetings/:id" element={<MeetingDetailPage />} />
          <Route path="members"      element={<MembersPage />} />
          <Route path="training"     element={<TrainingPage />} />
          <Route path="templates"    element={<TemplatesPage />} />
          <Route path="qr"           element={<QrPage />} />
          <Route path="documents"    element={<DocumentsPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
