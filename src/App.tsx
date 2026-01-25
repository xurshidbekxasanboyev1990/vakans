import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout';
import { PWAInstallPrompt } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';

// Pages
import { LoginPage, RegisterPage } from '@/pages/auth';
import { ChatPage } from '@/pages/chat/ChatPage';
import { AdminDashboard, EmployerDashboard, WorkerDashboard } from '@/pages/dashboard';
import { JobDetailPage, JobsPage } from '@/pages/jobs';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// Protected Route Component
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Guest Route - only for non-authenticated users
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Dashboard Router based on role
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'worker':
    default:
      return <WorkerDashboard />;
  }
}

// Home page - redirect authenticated users to dashboard
function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <PWAInstallPrompt />
      <Routes>
        {/* Landing - redirect to dashboard if authenticated */}
        <Route path="/" element={<HomePage />} />

        {/* Auth pages - no layout */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Pages with Layout */}
        <Route element={<Layout />}>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Worker Routes */}
          <Route path="/worker/applications" element={<ProtectedRoute roles={['worker']}><Navigate to="/dashboard" replace /></ProtectedRoute>} />

          {/* Employer Routes */}
          <Route path="/employer" element={<ProtectedRoute roles={['employer']}><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/employer/jobs" element={<ProtectedRoute roles={['employer']}><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/employer/applications" element={<ProtectedRoute roles={['employer']}><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/jobs/create" element={<ProtectedRoute roles={['employer']}><Navigate to="/dashboard" replace /></ProtectedRoute>} />

          {/* Profile & Settings */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Navigate to="/" replace />} />

          {/* Dashboard - with Layout for header */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
