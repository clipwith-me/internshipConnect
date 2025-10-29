// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 🎓 LEARNING: Protected Routes
 * 
 * Prevents unauthorized access to protected pages.
 * Redirects to login if not authenticated.
 * 
 * Features:
 * - Authentication check
 * - Role-based access
 * - Redirect with return URL
 * - Loading state
 */

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">403</h1>
          <p className="text-xl text-neutral-600 mb-8">
            Access Denied
          </p>
          <p className="text-neutral-500 mb-6">
            You don't have permission to access this page.
            This page is only for {requiredRole}s.
          </p>
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
  
  // Render protected content
  return children;
};

/**
 * Redirect if already authenticated
 * Used for login/register pages
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }
  
  return children;
};

export default ProtectedRoute;

/**
 * 🎓 USAGE IN ROUTES:
 * 
 * import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
 * 
 * // Protected routes (require authentication)
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <DashboardLayout />
 *     </ProtectedRoute>
 *   }
 * >
 *   <Route index element={<DashboardPage />} />
 * </Route>
 * 
 * // Role-specific routes
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute requiredRole="admin">
 *       <AdminPanel />
 *     </ProtectedRoute>
 *   }
 * />
 * 
 * // Guest routes (redirect if logged in)
 * <Route
 *   path="/auth"
 *   element={
 *     <GuestRoute>
 *       <AuthLayout />
 *     </GuestRoute>
 *   }
 * >
 *   <Route path="login" element={<LoginPage />} />
 *   <Route path="register" element={<RegisterPage />} />
 * </Route>
 */