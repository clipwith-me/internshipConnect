// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * Load user on mount if token exists
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
          setProfile(response.data.data.profile);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Token invalid, clear storage
          localStorage.clear();
        }
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
      setError(message);
      return { success: false, error: message };
    }
  };
  
  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.clear();
      
      // Clear state
      setUser(null);
      setProfile(null);
      setError(null);
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