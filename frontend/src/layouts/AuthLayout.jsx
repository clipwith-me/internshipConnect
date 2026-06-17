// frontend/src/layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-20 py-10">
        <div className="mx-auto w-full max-w-sm lg:w-[420px]">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block group">
              <img
                src="/logo-primary.png"
                alt="InternshipConnect"
                className="h-12 w-auto object-contain mx-auto group-hover:opacity-90 transition-opacity duration-200"
                onError={(e) => { e.target.src = '/logo-icon.png'; }}
              />
              <p className="text-xs text-neutral-500 mt-2 font-medium tracking-wide">Find internships across Africa</p>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-7 sm:p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-neutral-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', animationDelay: '1.5s' }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-16 text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-8 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Now available across Africa
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight text-white">
            Your next career step<br />starts here
          </h2>
          <p className="text-base text-white/60 mb-10 leading-relaxed max-w-xs">
            Connect with organizations across Africa offering real internship opportunities.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            {[
              { icon: '🎯', title: 'Smart matching', desc: 'Opportunities matched to your skills and goals' },
              { icon: '📄', title: 'AI resume builder', desc: 'Create standout resumes in minutes' },
              { icon: '🚀', title: 'Direct applications', desc: 'Apply directly to verified organizations' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-lg flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-8"></div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'Free', label: 'For students' },
              { value: 'Fast', label: 'Apply in minutes' },
              { value: '🌍', label: 'Africa-focused' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
