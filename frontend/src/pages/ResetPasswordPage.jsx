import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Alert, Button, Input } from '../components';
import { authAPI } from '../services/api';

const RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Choose a new password | InternshipConnect';
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null }));
    setApiError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!RULE.test(form.password)) next.password = 'Use at least 8 characters with an uppercase letter, a lowercase letter and a number.';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ token, password: form.password });
      if (res.data.success) setDone(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'This link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">This link isn't valid</h1>
        <p className="mt-3 text-sm text-neutral-600">The reset link is missing or has expired.</p>
        <Button as={Link} to="/auth/forgot-password" className="mt-6" fullWidth>Request a new link</Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Password updated</h1>
        <p className="mt-3 text-sm text-neutral-700" role="status">Your password has been changed. You've been signed out everywhere, so sign in again with the new one.</p>
        <Button as={Link} to="/auth/login" className="mt-6" size="lg" fullWidth>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Choose a new password</h1>
      <p className="mt-2 text-sm text-neutral-600">Use at least 8 characters with an uppercase letter, a lowercase letter and a number.</p>

      {apiError && (
        <Alert variant="error" className="mt-6">
          {apiError} <Link to="/auth/forgot-password" className="font-semibold underline">Request a new link</Link>
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <Input label="New password" name="password" type="password" autoComplete="new-password" icon={<Lock size={16} />} value={form.password} onChange={change} error={errors.password} />
        <Input label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" icon={<Lock size={16} />} value={form.confirmPassword} onChange={change} error={errors.confirmPassword} />
        <Button type="submit" size="lg" fullWidth loading={loading}>{loading ? 'Saving…' : 'Update password'}</Button>
      </form>

      <Link to="/auth/login" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">Back to sign in</Link>
    </div>
  );
};

export default ResetPasswordPage;
