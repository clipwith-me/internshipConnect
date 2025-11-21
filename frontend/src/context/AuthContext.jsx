// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

/**
 * 🎓 LEARNING: React Context
 * 
 * Context provides a way to share data globally without prop drilling.
 * Perfect for auth state that's needed everywhere.
 * 
 * Components:
 * - Context: The data container
 * - Provider: Makes data available to children
 * - useContext hook: Access the data
 */

// ═══════════════════════════════════════════════════════════
// CREATE CONTEXT
// ═══════════════════════════════════════════════════════════

const AuthContext = createContext(null);

// ═══════════════════════════════════════════════════════════
// AUTH PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * Load user on mount if token exists
   *
   * ✅ FIX: Don't call /auth/me on app load to avoid issues with expired tokens.
   * The Axios interceptor will handle token refresh automatically when the first
   * protected API call is made. This prevents the app from logging out users who
   * have expired access tokens but valid refresh tokens.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        // ✅ Tokens exist - user will be loaded when first protected route is accessed
        // The Axios interceptor will refresh the token if it's expired
        try {
          // Try to get user data, but don't fail if token is expired
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
          setProfile(response.data.data.profile);
        } catch (error) {
          // ✅ FIX: Don't clear localStorage on 401 - Axios interceptor will handle refresh
          if (error.response?.status === 401) {
            console.log('Access token expired - will refresh on next request');
            // Don't clear storage - let the Axios interceptor refresh the token
          } else if (error.name === 'AbortError' || error.name === 'CanceledError') {
            // Request was cancelled, ignore
            console.log('Initial auth request cancelled');
          } else {
            // Other error - clear storage and logout
            console.error('Failed to load user:', error);
            localStorage.clear();
          }
        }
      } else if (token && !refreshToken) {
        // Have access token but no refresh token - clear and require login
        console.log('No refresh token found - clearing storage');
        localStorage.clear();
      }

      setLoading(false);
    };

    initAuth();
  }, []);
  
  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
      const { user, profile, tokens } = response.data.data;
      
      // Save tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Update state
      setUser(user);
      setProfile(profile);
      
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };
  
  /**
   * Register function
   */
  const register = async (data) => {
    try {
      setError(null);
      const response = await authAPI.register(data);
      
      const { user, profile, tokens } = response.data.data;
      
      // Save tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Update state
      setUser(user);
      setProfile(profile);
      
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      const errorMessage = errors ? errors.join(', ') : message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  /**
   * Logout function
   *
   * 🎓 MICROSOFT-GRADE SECURITY:
   * - Invalidates session on backend
   * - Clears all local storage tokens
   * - Resets authentication state
   * - Redirects to login page to prevent unauthorized access
   */
  const logout = async () => {
    try {
      // Call backend to invalidate session (if using session-based auth)
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all local storage (tokens, cached data)
      localStorage.clear();

      // Reset authentication state
      setUser(null);
      setProfile(null);
      setError(null);

      // Redirect to login page
      navigate('/auth/login', { replace: true });
    }
  };
  
  /**
   * Update profile
   */
  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };
  
  /**
   * Update user
   */
  const updateUser = (newUser) => {
    setUser(newUser);
  };
  
  /**
   * Check if user has feature
   */
  const hasFeature = (featureName) => {
    return user?.subscription?.features?.[featureName] === true;
  };
  
  /**
   * Check if user is premium
   */
  const isPremium = () => {
    return ['premium', 'enterprise'].includes(user?.subscription?.plan);
  };
  
  // Context value
  const value = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    hasFeature,
    isPremium,
    isAuthenticated: !!user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════
// CUSTOM HOOK
// ═══════════════════════════════════════════════════════════

/**
 * Hook to access auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * 1. WRAP APP WITH PROVIDER (in main.jsx or App.jsx)
 * 
 * import { AuthProvider } from './context/AuthContext';
 * 
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * 
 * 2. USE IN COMPONENTS
 * 
 * import { useAuth } from '../context/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please login</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * 
 * 
 * 3. LOGIN FORM
 * 
 * function LoginPage() {
 *   const { login, error } = useAuth();
 *   const navigate = useNavigate();
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await login(email, password);
 *     
 *     if (result.success) {
 *       navigate('/dashboard');
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div>{error}</div>}
 *       <input type="email" />
 *       <input type="password" />
 *       <button>Login</button>
 *     </form>
 *   );
 * }
 * 
 * 
 * 4. PROTECTED ROUTE
 * 
 * function ProtectedRoute({ children }) {
 *   const { isAuthenticated, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   
 *   if (!isAuthenticated) {
 *     return <Navigate to="/auth/login" />;
 *   }
 *   
 *   return children;
 * }
 * 
 * 
 * 5. FEATURE CHECK
 * 
 * function AIResumeButton() {
 *   const { hasFeature, isPremium } = useAuth();
 *   
 *   if (!hasFeature('aiResumeBuilder')) {
 *     return (
 *       <div>
 *         <p>AI Resume Builder requires premium</p>
 *         <button>Upgrade Now</button>
 *       </div>
 *     );
 *   }
 *   
 *   return <button>Generate AI Resume</button>;
 * }
 */