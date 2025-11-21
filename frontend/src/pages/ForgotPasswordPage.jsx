// frontend/src/pages/ForgotPasswordPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Input, Button } from '../components';
import { authAPI } from '../services/api';

/**
 * 🔐 Forgot Password Page
 *
 * Allows users to request a password reset email
 */

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setSuccess(true);
        // Log reset token in development
        if (response.data.resetToken) {
          console.log('🔑 Reset Token (DEV ONLY):', response.data.resetToken);
          console.log('🔗 Reset URL:', `/auth/reset-password/${response.data.resetToken}`);
        }
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-3">
          Check Your Email
        </h2>

        <p className="text-neutral-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>.
          <br />
          The link will expire in 10 minutes.
        </p>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary-800">
            <strong>📧 Didn't receive the email?</strong>
            <br />
            Check your spam folder or try again in a few minutes.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="w-full px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors"
          >
            Send Another Email
          </button>

          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-neutral-600">
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          required
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>

      <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-xs text-neutral-600 text-center">
          <strong>Security Tip:</strong> For your security, the reset link will expire in 10 minutes.
          If you don't receive an email, check your spam folder or try again.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;