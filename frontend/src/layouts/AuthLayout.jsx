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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right gradient blob */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        {/* Bottom-left gradient blob */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        {/* Center gradient blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <h1 className="text-2xl font-bold text-primary-600 tracking-tight transition-transform duration-300 group-hover:scale-105">
              InternshipConnect
            </h1>
            <p className="text-xs text-neutral-500 mt-1">AI-Powered Career Matching</p>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 sm:p-10 backdrop-blur-sm">
          {/* Form Content (from Outlet) */}
          <Outlet />
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-xs text-neutral-500">
          <p>
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Privacy Policy
            </Link>
          </p>
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