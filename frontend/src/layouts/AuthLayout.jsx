// frontend/src/layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';

/**
 * 🎓 LEARNING: Auth Layout
 * 
 * Layout for authentication pages (login, register, forgot password).
 * 
 * Features:
 * - Split-screen design (form on left, image/info on right)
 * - Microsoft-style clean aesthetics
 * - Responsive (stacks on mobile)
 * - Logo and branding
 */

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-sm lg:w-[440px]">
          {/* Logo - Microsoft Style: Clean, moderate size, centered on auth pages */}
          <div className="mb-12 text-center">
            <Link to="/" className="inline-block group">
              <img
                src="/intern-logo.png"
                alt="InternshipConnect"
                className="h-32 w-auto object-contain mx-auto group-hover:opacity-80 transition-opacity duration-200"
                onError={(e) => {
                  e.target.src = '/intern-logo.jpeg';
                }}
              />
              <p className="text-sm text-neutral-600 mt-3 font-medium tracking-wide">AI-Powered Career Matching</p>
            </Link>
          </div>

          {/* Form Content Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-8 sm:p-10 backdrop-blur-sm">
            <Outlet />
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-xs text-neutral-500">
            <p>
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 text-white">
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Connect with your dream internship
          </h2>
          <p className="text-lg xl:text-xl text-primary-100 mb-12 leading-relaxed">
            Join thousands of students and organizations using AI-powered matching to find the perfect fit.
          </p>

          {/* Features */}
          <div className="space-y-5">
            <Feature
              icon="✨"
              title="AI-Powered Matching"
              description="Smart algorithms connect you with relevant opportunities"
            />
            <Feature
              icon="📄"
              title="AI Resume Builder"
              description="Generate professional resumes tailored to each position"
            />
            <Feature
              icon="🚀"
              title="Priority Applications"
              description="Stand out with featured and priority application options"
            />
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <Stat number="10K+" label="Students" />
            <Stat number="500+" label="Companies" />
            <Stat number="2K+" label="Internships" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature component for the right side
const Feature = ({ icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-primary-100 text-sm">{description}</p>
    </div>
  </div>
);

// Stat component
const Stat = ({ number, label }) => (
  <div>
    <div className="text-3xl font-bold">{number}</div>
    <div className="text-primary-100 text-sm">{label}</div>
  </div>
);

export default AuthLayout;

/**
 * 🎓 USAGE IN ROUTING:
 * 
 * <Routes>
 *   <Route path="/auth" element={<AuthLayout />}>
 *     <Route path="login" element={<LoginPage />} />
 *     <Route path="register" element={<RegisterPage />} />
 *     <Route path="forgot-password" element={<ForgotPasswordPage />} />
 *   </Route>
 * </Routes>
 * 
 * // LoginPage.jsx example
 * import { Input, Button } from '@/components';
 * 
 * function LoginPage() {
 *   return (
 *     <div>
 *       <h2 className="text-2xl font-bold text-neutral-900 mb-2">
 *         Welcome back
 *       </h2>
 *       <p className="text-neutral-500 mb-6">
 *         Enter your credentials to continue
 *       </p>
 *       
 *       <form className="space-y-4">
 *         <Input
 *           label="Email"
 *           type="email"
 *           placeholder="you@example.com"
 *           required
 *         />
 *         <Input
 *           label="Password"
 *           type="password"
 *           required
 *         />
 *         
 *         <Button fullWidth>
 *           Sign In
 *         </Button>
 *       </form>
 *       
 *       <p className="mt-6 text-center text-sm text-neutral-500">
 *         Don't have an account?{' '}
 *         <Link to="/auth/register" className="text-primary-500 hover:text-primary-600 font-medium">
 *           Sign up
 *         </Link>
 *       </p>
 *     </div>
 *   );
 * }
 */