import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const NAV_LINKS = [
  { label: 'Browse opportunities', to: '/internships' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'For employers', to: '/#for-employers' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const linkBase =
  'rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

/**
 * Public site navigation. Sticky, light, with a real mobile menu
 * (disclosure pattern: aria-expanded/aria-controls, Escape closes, closes on navigation).
 */
export default function PublicNav() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-sticky border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label="InternshipConnect home">
          <img src="/logo-transparent.png" alt="" width="1028" height="265" className="h-8 w-auto sm:h-9" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={label}>
              <NavLink to={to} end className={`${linkBase} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900`}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!loading &&
            (isAuthenticated ? (
              <Button as={Link} to="/dashboard" size="sm" className="hidden sm:inline-flex">
                Go to dashboard
              </Button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className={`${linkBase} hidden text-neutral-700 hover:bg-neutral-100 sm:inline-flex`}
                >
                  Sign in
                </Link>
                <Button as={Link} to="/auth/register" size="sm" className="hidden sm:inline-flex">
                  Get started free
                </Button>
              </>
            ))}

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-neutral-200 bg-white lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="block rounded-md px-3 py-3 text-base font-medium text-neutral-800 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {!loading && (
            <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-neutral-200 px-4 py-4 sm:flex-row sm:px-6">
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" fullWidth>
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/auth/register" fullWidth>
                    Get started free
                  </Button>
                  <Button as={Link} to="/auth/login" variant="secondary" fullWidth>
                    Sign in
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
