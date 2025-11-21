// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Input, Button } from '../components';
import { useAuth } from '../context/AuthContext';

/**
 * 🎓 LEARNING: Login Page
 * 
 * Complete login form with validation and error handling.
 * 
 * Features:
 * - Email and password inputs
 * - Form validation
 * - Error messages
 * - Loading state
 * - Remember redirect location
 * - Links to register and forgot password
 */

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/dashboard';
  
  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };
  
  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    setLoading(false);
    
    if (result.success) {
      // Redirect to original destination or dashboard
      navigate(from, { replace: true });
    }
  };
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
          Welcome back
        </h2>
        <p className="text-base text-neutral-600">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 animate-slideInDown">
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-error-800">Login Failed</p>
            <p className="text-sm text-error-700 mt-1">{authError}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail size={18} />}
          required
          autoComplete="email"
        />

        {/* Password Input */}
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock size={18} />}
          required
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <span className="ml-2 text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-primary-500 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          className="h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-8 mb-6 flex items-center">
        <div className="flex-1 border-t border-neutral-300"></div>
        <span className="px-4 text-sm text-neutral-500 font-medium">Or continue with</span>
        <div className="flex-1 border-t border-neutral-300"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center px-4 py-3 bg-white border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 shadow-sm hover:shadow group"
        >
          <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center px-4 py-3 bg-white border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 shadow-sm hover:shadow group"
        >
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">GitHub</span>
        </button>
      </div>

      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="font-semibold text-primary-500 hover:text-primary-700 transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

/**
 * 🎓 KEY CONCEPTS DEMONSTRATED:
 * 
 * 1. FORM STATE MANAGEMENT
 *    - useState for form data
 *    - Controlled inputs (value + onChange)
 *    - Real-time validation
 * 
 * 2. AUTH CONTEXT USAGE
 *    - useAuth hook to access login function
 *    - Error handling from context
 * 
 * 3. NAVIGATION
 *    - useNavigate for programmatic navigation
 *    - useLocation to get redirect URL
 *    - Navigate after successful login
 * 
 * 4. FORM VALIDATION
 *    - Client-side validation
 *    - Error display per field
 *    - Prevent submission if invalid
 * 
 * 5. UX BEST PRACTICES
 *    - Loading states
 *    - Error messages
 *    - Auto-focus on first input
 *    - Remember me checkbox
 *    - Forgot password link
 */