// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ComponentShowcase from './pages/ComponentShowcase';

/**
 * 🎓 LEARNING: React Router Setup
 * 
 * React Router enables client-side routing - changing pages without
 * full page reloads.
 * 
 * Key concepts:
 * - BrowserRouter: Provides routing context
 * - Routes: Container for all routes
 * - Route: Defines a route (path + component)
 * - Navigate: Redirects to another route
 * - Nested routes: Parent layouts with child pages
 */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to showcase for now */}
        <Route path="/" element={<Navigate to="/showcase" replace />} />
        
        {/* Component Showcase (for Day 2 testing) */}
        <Route path="/showcase" element={<ComponentShowcase />} />
        
        {/* Auth Routes - will build in Day 3 */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        
        {/* Dashboard Routes - will build in Day 4-8 */}
        <Route path="/dashboard" element={<DashboardLayout />}>
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
  );
}

// ═══════════════════════════════════════════════════════════
// PLACEHOLDER PAGES (will create these in later days)
// ═══════════════════════════════════════════════════════════

function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Welcome back
      </h2>
      <p className="text-neutral-500 mb-6">
        Login page - Coming in Day 3
      </p>
    </div>
  );
}

function RegisterPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Create your account
      </h2>
      <p className="text-neutral-500 mb-6">
        Register page - Coming in Day 3
      </p>
    </div>
  );
}

function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        Reset your password
      </h2>
      <p className="text-neutral-500 mb-6">
        Forgot password page - Coming in Day 3
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
        Dashboard content - Coming in Day 4
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
        Internships listing - Coming in Day 4
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
        Applications page - Coming in Day 4
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
        Resumes page - Coming in Day 5
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
        Settings page - Coming in Day 8
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
          href="/showcase" 
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Go to Component Showcase
        </a>
      </div>
    </div>
  );
}

export default App;

/**
 * 🎓 ROUTING EXPLAINED:
 * 
 * 1. BASIC ROUTES
 *    <Route path="/showcase" element={<ComponentShowcase />} />
 *    - Renders ComponentShowcase when URL is /showcase
 * 
 * 2. NESTED ROUTES (Layouts)
 *    <Route path="/auth" element={<AuthLayout />}>
 *      <Route path="login" element={<LoginPage />} />
 *    </Route>
 *    - AuthLayout renders for /auth/*
 *    - LoginPage renders inside AuthLayout's <Outlet /> at /auth/login
 * 
 * 3. INDEX ROUTES
 *    <Route index element={<DashboardPage />} />
 *    - Renders at parent path (/dashboard)
 *    - No path needed
 * 
 * 4. REDIRECTS
 *    <Route path="/" element={<Navigate to="/showcase" />} />
 *    - Automatically redirects to /showcase
 * 
 * 5. CATCH-ALL (404)
 *    <Route path="*" element={<NotFoundPage />} />
 *    - Matches any undefined route
 */