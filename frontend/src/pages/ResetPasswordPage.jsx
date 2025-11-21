// frontend/src/pages/ResetPasswordPage.jsx

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Input, Button } from '../components';
import { authAPI } from '../services/api';

/**
 * 🔐 Reset Password Page
 *
 * Allows users to reset their password using a token from email
 */

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const validateForm = () => {
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        token,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-3">
          Invalid Reset Link
        </h2>

        <p className="text-neutral-600 mb-6">
          This password reset link is invalid or has expired.
        </p>

        <Link
          to="/auth/forgot-password"
          className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-3">
          Password Reset Successful!
        </h2>

        <p className="text-neutral-600 mb-6">
          Your password has been successfully reset.
          <br />
          Redirecting you to login...
        </p>

        <div className="flex items-center justify-center gap-2 text-primary-600">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Reset Your Password
        </h2>
        <p className="text-neutral-600">
          Enter your new password below
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          name="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          icon={<Lock size={18} />}
          required
          autoFocus
          helperText="Must be at least 8 characters"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={<Lock size={18} />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Back to Login
        </Link>
      </div>

      <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-xs text-neutral-600 text-center">
          <strong>Password Requirements:</strong>
          <br />
          • At least 8 characters long
          <br />
          • Mix of uppercase, lowercase, numbers, and symbols recommended
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;