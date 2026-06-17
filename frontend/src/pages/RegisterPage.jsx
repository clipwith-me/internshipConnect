// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, GraduationCap, Building2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Retail', 'Manufacturing', 'Media & Creative', 'Agriculture', 'Other',
];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-400' };
  if (score <= 5) return { score, label: 'Good', color: 'bg-emerald-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '',
    companyName: '', industry: 'technology',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Must contain uppercase, lowercase, and a number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (role === 'student') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
    } else {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const registrationData = {
      email: formData.email, password: formData.password, role,
      ...(role === 'student' && { firstName: formData.firstName, lastName: formData.lastName }),
      ...(role === 'organization' && { companyName: formData.companyName, industry: formData.industry.toLowerCase() }),
    };
    const result = await register(registrationData);
    setLoading(false);
    if (result.success) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-1 tracking-tight">Create your account</h2>
        <p className="text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-primary-500 hover:text-primary-700 transition-colors">Sign in</Link>
        </p>
      </div>

      {authError && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slideInTop">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-red-700">{authError}</p>
        </div>
      )}

      {/* Role selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-3">I am joining as a…</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'student', icon: GraduationCap, label: 'Student', sub: 'Find internships' },
            { id: 'organization', icon: Building2, label: 'Organization', sub: 'Hire interns' },
          ].map(({ id, icon: Icon, label, sub }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRole(id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                role === id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {role === id && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === id ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-500'}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${role === id ? 'text-primary-700' : 'text-neutral-700'}`}>{label}</p>
                <p className="text-xs text-neutral-500">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student name fields */}
        {role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'firstName', label: 'First name', placeholder: 'Amara' },
              { id: 'lastName', label: 'Last name', placeholder: 'Okafor' },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
                <input
                  id={id}
                  type="text"
                  placeholder={placeholder}
                  value={formData[id]}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all ${errors[id] ? 'border-red-400 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                />
                {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Org fields */}
        {role === 'organization' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-1.5">Company name</label>
              <input
                id="companyName"
                type="text"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
            </div>
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 mb-1.5">Industry</label>
              <select
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all hover:border-neutral-300"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind.toLowerCase()}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><Mail size={16} /></div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><Lock size={16} /></div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-11 py-2.5 text-sm border rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-neutral-200 hover:border-neutral-300'}`}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-neutral-200'}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score <= 4 ? 'text-amber-500' : 'text-emerald-600'}`}>
                {passwordStrength.label} password
              </p>
            </div>
          )}
          {errors.password && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> {errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"><Lock size={16} /></div>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-11 py-2.5 text-sm border rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all ${errors.confirmPassword ? 'border-red-400 bg-red-50' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-emerald-400 bg-emerald-50' : 'border-neutral-200 hover:border-neutral-300'}`}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> {errors.confirmPassword}</p>}
          {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1"><Check size={12} strokeWidth={3} /> Passwords match</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input type="checkbox" required className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600">
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-primary-500 hover:text-primary-700">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="font-medium text-primary-500 hover:text-primary-700">Privacy Policy</Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            <>Create account <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
