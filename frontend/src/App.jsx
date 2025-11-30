// frontend/src/App.jsx - OPTIMIZED WITH CODE SPLITTING
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// ✅ PERFORMANCE: Keep critical layouts loaded immediately
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// ✅ PERFORMANCE: Lazy load all page components for code splitting
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const InternshipsPage = lazy(() => import('./pages/InternshipsPage'));
const InternshipDetailPage = lazy(() => import('./pages/InternshipDetailPage'));
const MyInternshipsPage = lazy(() => import('./pages/MyInternshipsPage'));
const CreateInternshipPage = lazy(() => import('./pages/CreateInternshipPage'));
const EditInternshipPage = lazy(() => import('./pages/EditInternshipPage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ResumesPage = lazy(() => import('./pages/ResumesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

// ✅ PERFORMANCE: Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-neutral-600 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Component Showcase (for testing) */}
              <Route path="/showcase" element={<ComponentShowcase />} />

          {/* Auth Routes (Guest only - redirect if logged in) */}
          <Route
            path="/auth"
            element={
              <GuestRoute>
                <AuthLayout />
              </GuestRoute>
            }
          >
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Dashboard Routes (Protected - require authentication) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="internships" element={<InternshipsPage />} />
            {/* ✅ SECURITY: Organization-only routes */}
            <Route path="internships/create" element={
              <ProtectedRoute requiredRole="organization">
                <CreateInternshipPage />
              </ProtectedRoute>
            } />
            <Route path="internships/:id" element={<InternshipDetailPage />} />
            <Route path="internships/:id/edit" element={
              <ProtectedRoute requiredRole="organization">
                <EditInternshipPage />
              </ProtectedRoute>
            } />
            <Route path="my-internships" element={
              <ProtectedRoute requiredRole="organization">
                <MyInternshipsPage />
              </ProtectedRoute>
            } />
            <Route path="applications" element={<ApplicationsPage />} />
            {/* ✅ SECURITY: Student-only routes */}
            <Route path="resumes" element={
              <ProtectedRoute requiredRole="student">
                <ResumesPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER PAGES
// ═══════════════════════════════════════════════════════════

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-xl text-neutral-600 mb-8">Page not found</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;