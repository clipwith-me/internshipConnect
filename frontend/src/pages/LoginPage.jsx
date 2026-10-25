// frontend/src/pages/LoginPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input } from '../components';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Return to where the user was headed, including any query string.
  const fromState = location.state?.from;
  const from = fromState ? `${fromState.pathname}${fromState.search || ''}` : '/dashboard';

  useEffect(() => {
    document.title = 'Sign in | InternshipConnect';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Only check presence/format here. Password rules belong to registration;
  // enforcing a minimum length at sign-in would lock out older, shorter passwords.
  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = 'Enter your email address';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Enter a valid email address';
    if (!formData.password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    const result = await login(formData.email.trim(), formData.password);
    setLoading(false);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-600">
        New to InternshipConnect?{' '}
        <Link to="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700">
          Create a free account
        </Link>
      </p>

      {authError && (
        <Alert variant="error" className="mt-6">
          {authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          icon={<Mail size={16} />}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            icon={<Lock size={16} />}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <div className="mt-2 text-right">
            <Link to="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
