// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, AlertCircle } from 'lucide-react';
import { Input, Button, Badge } from '../components';
import { useAuth } from '../context/AuthContext';

/**
 * 🎓 LEARNING: Register Page
 * 
 * Multi-step registration form with role selection.
 * 
 * Features:
 * - Role selection (student/organization)
 * - Role-specific fields
 * - Form validation
 * - Password strength indicator
 * - Error handling
 */

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    firstName: '',
    lastName: '',
    // Organization fields
    companyName: '',
    industry: 'technology',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: null
      }));
    }
  };
  
  /**
   * Calculate password strength
   */
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Complexity
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, text: 'Weak', color: 'bg-error-500' };
    if (score <= 4) return { score, text: 'Fair', color: 'bg-warning-500' };
    if (score <= 5) return { score, text: 'Good', color: 'bg-success-500' };
    return { score, text: 'Strong', color: 'bg-success-600' };
  };
  
  const passwordStrength = getPasswordStrength();
  
  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};
    
    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role-specific validation
    if (role === 'student') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
    } else if (role === 'organization') {
      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      }
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
    
    const registrationData = {
      email: formData.email,
      password: formData.password,
      role,
      ...(role === 'student' && {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        }
      }),
      ...(role === 'organization' && {
        companyInfo: {
          name: formData.companyName,
          industry: formData.industry,
        }
      }),
    };
    
    const result = await register(registrationData);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Create your account
        </h2>
        <p className="text-neutral-600">
          Join InternshipConnect and start your journey
        </p>
      </div>
      
      {/* Error Alert */}
      {authError && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start gap-3">
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-error-800">Registration Failed</p>
            <p className="text-sm text-error-700 mt-1">{authError}</p>
          </div>
        </div>
      )}
      
      {/* Role Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          I am a...
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`p-4 border-2 rounded-lg transition-all ${
              role === 'student'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <User className={`mx-auto mb-2 ${
              role === 'student' ? 'text-primary-500' : 'text-neutral-400'
            }`} size={32} />
            <p className={`font-medium ${
              role === 'student' ? 'text-primary-700' : 'text-neutral-700'
            }`}>
              Student
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Looking for internships
            </p>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('organization')}
            className={`p-4 border-2 rounded-lg transition-all ${
              role === 'organization'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <Building className={`mx-auto mb-2 ${
              role === 'organization' ? 'text-primary-500' : 'text-neutral-400'
            }`} size={32} />
            <p className={`font-medium ${
              role === 'organization' ? 'text-primary-700' : 'text-neutral-700'
            }`}>
              Organization
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Hiring interns
            </p>
          </button>
        </div>
      </div>
      
      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Fields */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              type="text"
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              id="lastName"
              type="text"
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>
        )}
        
        {/* Organization Fields */}
        {role === 'organization' && (
          <>
            <Input
              id="companyName"
              type="text"
              label="Company Name"
              placeholder="Acme Inc."
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              icon={<Building size={18} />}
              required
            />
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}
        
        {/* Email */}
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
        
        {/* Password */}
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
          />
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-600">Password strength:</span>
                <Badge
                  size="sm"
                  variant={
                    passwordStrength.score <= 2 ? 'error' :
                    passwordStrength.score <= 4 ? 'warning' : 'success'
                  }
                >
                  {passwordStrength.text}
                </Badge>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i <= passwordStrength.score ? passwordStrength.color : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Confirm Password */}
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock size={18} />}
          required
          autoComplete="new-password"
        />
        
        {/* Terms & Conditions */}
        <div className="flex items-start">
          <input
            type="checkbox"
            required
            className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500 mt-1"
          />
          <label className="ml-2 text-sm text-neutral-700">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-500 hover:text-primary-600 font-medium">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-500 hover:text-primary-600 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      
      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-primary-500 hover:text-primary-600"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;