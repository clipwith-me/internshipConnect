// frontend/src/layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { Check } from 'lucide-react';

// Everything claimed here exists in the product today.
const POINTS = [
  { title: 'For students', body: 'Search internships, apply in a few clicks and track every application.' },
  { title: 'For employers', body: 'Post internships and manage applicants from one dashboard.' },
  { title: 'For universities', body: 'See how your students are applying and being placed.' },
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <a href="#auth-form" className="skip-link">Skip to form</a>

      {/* Form column */}
      <div className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:px-16">
        <Link
          to="/"
          className="mx-auto mb-8 inline-flex rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:mx-0"
          aria-label="InternshipConnect home"
        >
          <img src="/logo-transparent.png" alt="" width="1028" height="265" className="h-10 w-auto" />
        </Link>

        <main id="auth-form" tabIndex={-1} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center outline-none lg:mx-0">
          <Outlet />
        </main>

        <p className="mx-auto mt-8 max-w-md text-center text-xs text-neutral-500 lg:mx-0 lg:text-left">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700">Terms</Link> and{' '}
          <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-700">Privacy Policy</Link>.
        </p>
      </div>

      {/* Brand column (desktop only) */}
      <aside className="relative hidden flex-1 overflow-hidden bg-neutral-900 lg:flex" aria-label="About InternshipConnect">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-success-500/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-20">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
            Your first internship starts here.
          </h2>
          <p className="mt-4 max-w-md text-neutral-300">
            One platform connecting students, employers and universities around early-career opportunities.
          </p>
          <ul className="mt-10 space-y-6">
            {POINTS.map(({ title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <Check size={14} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-neutral-400">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AuthLayout;
