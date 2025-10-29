// frontend/src/App.jsx - FIXED VERSION
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ComponentShowcase from './pages/ComponentShowcase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="resumes" element={<ResumesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER PAGES
// ═══════════════════════════════════════════════════════════

function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Reset your password
      </h2>
      <p className="text-neutral-500 mb-6">
        Enter your email to receive reset instructions
      </p>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Dashboard
      </h1>
      <p className="text-neutral-600">
        Welcome to your dashboard!
      </p>
    </div>
  );
}

function InternshipsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Internships
      </h1>
      <p className="text-neutral-600">
        Browse available internships
      </p>
    </div>
  );
}

function ApplicationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Applications
      </h1>
      <p className="text-neutral-600">
        View your applications
      </p>
    </div>
  );
}

function ResumesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Resumes
      </h1>
      <p className="text-neutral-600">
        Manage your resumes
      </p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        Settings
      </h1>
      <p className="text-neutral-600">
        Update your preferences
      </p>
    </div>
  );
}

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