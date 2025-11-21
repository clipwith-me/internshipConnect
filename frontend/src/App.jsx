// frontend/src/App.jsx - FIXED VERSION
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ComponentShowcase from './pages/ComponentShowcase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InternshipsPage from './pages/InternshipsPage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import MyInternshipsPage from './pages/MyInternshipsPage';
import CreateInternshipPage from './pages/CreateInternshipPage';
import EditInternshipPage from './pages/EditInternshipPage';
import ApplicationsPage from './pages/ApplicationsPage';
import DashboardPage from './pages/DashboardPage';
import ResumesPage from './pages/ResumesPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
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