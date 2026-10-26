import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Alert, Button, Input } from '../components';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Reset your password | InternshipConnect';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Enter your email address');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address');

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email: email.trim() });
      if (response.data.success) {
        setSent(true);
        // Local development only: the API returns the token so flows can be tested without email.
        if (import.meta.env.DEV && response.data.resetToken) {
          console.log('Reset URL (DEV ONLY):', `/auth/reset-password/${response.data.resetToken}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'We could not send the email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Check your email</h1>
        <p className="mt-3 text-sm text-neutral-700" role="status">
          If an account exists for <strong>{email}</strong>, we've sent a link to reset the password. It expires in 10 minutes.
        </p>
        <p className="mt-3 text-sm text-neutral-600">Nothing arrived? Check your spam folder, or try again in a few minutes.</p>
        <div className="mt-6 space-y-3">
          <Button variant="secondary" fullWidth onClick={() => { setSent(false); setEmail(''); }}>Send another link</Button>
          <Link to="/auth/login" className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
            <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Forgot your password?</h1>
      <p className="mt-2 text-sm text-neutral-600">Enter your email and we'll send you a link to reset it.</p>

      {error && <Alert variant="error" className="mt-6">{error}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
      </form>

      <Link to="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
