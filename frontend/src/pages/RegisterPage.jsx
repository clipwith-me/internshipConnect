// frontend/src/pages/RegisterPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Building2, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input } from '../components';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Retail', 'Manufacturing', 'Media & Creative', 'Agriculture', 'Other',
];

const ROLES = [
  { id: 'student', icon: GraduationCap, label: 'Student', sub: 'Find internships' },
  { id: 'organization', icon: Building2, label: 'Employer', sub: 'Hire interns' },
  { id: 'university', icon: School, label: 'University', sub: 'Track students' },
];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', bar: '', text: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', bar: 'bg-error-500', text: 'text-error-600' };
  if (score <= 4) return { score, label: 'Fair', bar: 'bg-warning-500', text: 'text-warning-700' };
  return { score, label: score <= 5 ? 'Good' : 'Strong', bar: 'bg-success-500', text: 'text-success-600' };
};

const fieldLabelClass = 'mb-1.5 block text-sm font-medium text-neutral-700';
const selectClass =
  'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  // Landing-page CTAs link here with ?role=organization|university|student
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const [role, setRole] = useState(
    ROLES.some((r) => r.id === requestedRole) ? requestedRole : 'student'
  );

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '',
    companyName: '', industry: 'technology',
    universityName: '', state: '', coordinatorName: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    document.title = 'Create your account | InternshipConnect';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = 'Enter your email address';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Enter a valid email address';
    if (!formData.password) next.password = 'Create a password';
    else if (formData.password.length < 8) next.password = 'Use at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      next.password = 'Include an uppercase letter, a lowercase letter and a number';
    if (!formData.confirmPassword) next.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match';

    if (role === 'student') {
      if (!formData.firstName.trim()) next.firstName = 'Enter your first name';
      if (!formData.lastName.trim()) next.lastName = 'Enter your last name';
    } else if (role === 'university') {
      if (!formData.universityName.trim()) next.universityName = 'Enter your university name';
    } else if (!formData.companyName.trim()) {
      next.companyName = 'Enter your company name';
    }
    if (!agreed) next.agreed = 'You need to accept the Terms and Privacy Policy to continue';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      role,
      ...(role === 'student' && { firstName: formData.firstName.trim(), lastName: formData.lastName.trim() }),
      ...(role === 'organization' && { companyName: formData.companyName.trim(), industry: formData.industry.toLowerCase() }),
      ...(role === 'university' && {
        universityName: formData.universityName.trim(),
        state: formData.state.trim(),
        coordinatorName: formData.coordinatorName.trim(),
      }),
    };
    const result = await register(payload);
    setLoading(false);
    if (result.success) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
      </p>

      {authError && <Alert variant="error" className="mt-6">{authError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* Role: a real radio group, operable with arrow keys */}
        <fieldset>
          <legend className={fieldLabelClass}>I'm joining as</legend>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {ROLES.map(({ id, icon: Icon, label, sub }) => (
              <label
                key={id}
                className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ${
                  role === id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={id}
                  checked={role === id}
                  onChange={() => { setRole(id); setErrors({}); }}
                  className="sr-only"
                />
                <Icon size={20} className={role === id ? 'text-primary-600' : 'text-neutral-500'} aria-hidden="true" />
                <span className={`text-sm font-semibold ${role === id ? 'text-primary-700' : 'text-neutral-800'}`}>{label}</span>
                <span className="hidden text-xs text-neutral-500 sm:block">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {role === 'student' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" name="firstName" autoComplete="given-name" required value={formData.firstName} onChange={handleChange} error={errors.firstName} />
            <Input label="Last name" name="lastName" autoComplete="family-name" required value={formData.lastName} onChange={handleChange} error={errors.lastName} />
          </div>
        )}

        {role === 'organization' && (
          <div className="space-y-4">
            <Input label="Company name" name="companyName" autoComplete="organization" required value={formData.companyName} onChange={handleChange} error={errors.companyName} />
            <div>
              <label htmlFor="industry" className={fieldLabelClass}>Industry</label>
              <select id="industry" name="industry" value={formData.industry} onChange={handleChange} className={selectClass}>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind.toLowerCase()}>{ind}</option>)}
              </select>
            </div>
          </div>
        )}

        {role === 'university' && (
          <div className="space-y-4">
            <Input label="University name" name="universityName" required placeholder="e.g. University of Lagos" value={formData.universityName} onChange={handleChange} error={errors.universityName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Coordinator or office (optional)" name="coordinatorName" placeholder="SIWES / Career Services" value={formData.coordinatorName} onChange={handleChange} />
              <Input label="State (optional)" name="state" placeholder="Lagos" value={formData.state} onChange={handleChange} />
            </div>
          </div>
        )}

        <Input
          label="Email address" name="email" type="email" autoComplete="email" inputMode="email"
          icon={<Mail size={16} />} required value={formData.email} onChange={handleChange} error={errors.email}
        />

        <div>
          <Input
            label="Password" name="password" type="password" autoComplete="new-password"
            icon={<Lock size={16} />} required value={formData.password} onChange={handleChange} error={errors.password}
            helperText="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
          />
          {formData.password && (
            <div className="mt-2" role="status" aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.bar : 'bg-neutral-200'}`} />
                ))}
              </div>
              <p className={`mt-1 text-xs font-medium ${passwordStrength.text}`}>{passwordStrength.label} password</p>
            </div>
          )}
        </div>

        <Input
          label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password"
          icon={<Lock size={16} />} required value={formData.confirmPassword} onChange={handleChange}
          error={errors.confirmPassword}
          success={formData.confirmPassword && formData.password === formData.confirmPassword ? 'Passwords match' : undefined}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: null })); }}
              aria-invalid={errors.agreed ? true : undefined}
              aria-describedby={errors.agreed ? 'agreed-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-700">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreed && <p id="agreed-error" role="alert" className="mt-1.5 text-sm text-error-600">{errors.agreed}</p>}
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
