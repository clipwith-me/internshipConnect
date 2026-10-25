// frontend/src/layouts/DashboardLayout.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bookmark,
  Briefcase,
  ChevronDown,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  School,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

/* ───────────────────────── Navigation per role ───────────────────────── */

const NAV = {
  student: [
    { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Opportunities' },
    { to: '/dashboard/applications', icon: FileText, label: 'My applications' },
    { to: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
    { to: '/dashboard/resumes', icon: FileText, label: 'Resumes' },
    { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/dashboard/referrals', icon: Users, label: 'Refer a friend' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/pricing', icon: CreditCard, label: 'Plans' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  organization: [
    { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
    { to: '/dashboard/my-internships', icon: Briefcase, label: 'My listings' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
    { to: '/dashboard/students', icon: Users, label: 'Find students' },
    { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/verification', icon: ShieldCheck, label: 'Verification' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/pricing', icon: CreditCard, label: 'Plans' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  university: [
    { to: '/dashboard/university', icon: Home, label: 'Dashboard', end: true },
    { to: '/dashboard/university/students', icon: GraduationCap, label: 'Students' },
    { to: '/dashboard/university/profile', icon: School, label: 'Institution profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
    { to: '/dashboard/admin', icon: Settings, label: 'Admin panel' },
    { to: '/dashboard/founder', icon: BarChart3, label: 'Founder dashboard' },
    { to: '/dashboard/investor', icon: CreditCard, label: 'Investor view' },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Opportunities' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
};

// Five most-used destinations for the mobile bottom bar
const BOTTOM_TABS = {
  student: [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/internships', icon: Search, label: 'Search' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applied' },
    { to: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ],
  organization: [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/my-internships', icon: Briefcase, label: 'Listings' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applicants' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ],
  university: [
    { to: '/dashboard/university', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/university/students', icon: GraduationCap, label: 'Students' },
    { to: '/dashboard/university/profile', icon: School, label: 'Profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  admin: [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/admin', icon: Settings, label: 'Admin' },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Listings' },
    { to: '/dashboard/applications', icon: FileText, label: 'Apps' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
};

/* ───────────────────────── Helpers ───────────────────────── */

// Profile images can be stored as a string or as { url, publicId }.
const imageUrl = (value) => (typeof value === 'string' ? value : value?.url || null);

function getDisplayName(user, profile) {
  if (user.role === 'student' && profile?.personalInfo) {
    const { firstName, lastName } = profile.personalInfo;
    const full = `${firstName || ''} ${lastName || ''}`.trim();
    if (full) return full;
  }
  if (user.role === 'organization' && profile?.companyInfo?.name) return profile.companyInfo.name;
  if (user.role === 'university' && profile?.name) return profile.name;
  return user.name || user.email?.split('@')[0] || 'Account';
}

function getAvatar(user, profile) {
  if (user.role === 'student') return imageUrl(profile?.personalInfo?.profilePicture);
  if (user.role === 'organization') return imageUrl(profile?.companyInfo?.logo);
  if (user.role === 'university') return imageUrl(profile?.logo);
  return null;
}

const ROLE_LABEL = { student: 'Student', organization: 'Employer', university: 'University', admin: 'Admin' };

const sideLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`;

/* ───────────────────────── Layout ───────────────────────── */

const DashboardLayout = () => {
  // All hooks run on every render, before any early return (Rules of Hooks).
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const drawerButtonRef = useRef(null);

  const role = user?.role;
  const navItems = useMemo(() => NAV[role] || [], [role]);
  const bottomTabs = BOTTOM_TABS[role] || [];
  const canSearch = role === 'student' || role === 'organization';

  const displayName = user ? getDisplayName(user, profile) : '';
  const avatar = user ? getAvatar(user, profile) : null;
  const plan = user?.subscription?.plan;
  const showUpgrade = (role === 'student' && plan === 'free') || (role === 'organization' && plan === 'basic');

  // Close drawer/menu on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close account menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Drawer: Escape closes and returns focus; page behind does not scroll
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        drawerButtonRef.current?.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      navigate(`/dashboard/internships?search=${encodeURIComponent(q)}`);
      setSearchQuery('');
    },
    [searchQuery, navigate]
  );

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await logout();
  }, [logout]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50" role="status" aria-live="polite">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent motion-reduce:animate-none" />
          <p className="text-sm text-neutral-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const homePath = role === 'university' ? '/dashboard/university' : '/dashboard';

  const sidebarContent = (
    <>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={sideLink}>
            <Icon size={18} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
      {showUpgrade && (
        <div className="hidden shrink-0 border-t border-neutral-200 p-3 sm:block">
          <div className="rounded-lg bg-neutral-50 p-3">
            <p className="text-sm font-semibold text-neutral-900">Need more?</p>
            <p className="mt-0.5 text-xs leading-snug text-neutral-600">Compare plans and see what each includes.</p>
            <Link
              to="/dashboard/pricing"
              className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-md bg-primary-500 px-3 text-xs font-medium text-white hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              View plans
            </Link>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Top bar */}
      <header className="sticky top-0 z-sticky border-b border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              ref={drawerButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <Link
              to={homePath}
              className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="InternshipConnect dashboard home"
            >
              <img src="/logo-transparent.png" alt="" width="1028" height="265" className="h-8 w-auto sm:h-9" />
            </Link>
          </div>

          {canSearch && (
            <form onSubmit={handleSearch} role="search" className="hidden max-w-xl flex-1 md:block">
              <label htmlFor="global-search" className="sr-only">Search opportunities</label>
              <div className="relative">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="global-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities"
                  className="h-10 w-full rounded-md border border-neutral-300 bg-neutral-50 pl-10 pr-3 text-sm placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                />
              </div>
            </form>
          )}

          <div className="flex items-center gap-1 sm:gap-3">
            <NotificationBell />

            <div className="relative" ref={menuRef}>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                aria-label="Account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-500 text-sm font-semibold text-white">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-neutral-800 md:block">{displayName}</span>
                <ChevronDown size={16} className="hidden text-neutral-500 md:block" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 z-dropdown mt-2 w-60 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg animate-slideInTop"
                >
                  <div className="border-b border-neutral-200 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-neutral-900">{displayName}</p>
                    <p className="truncate text-xs text-neutral-500">{user.email}</p>
                    <p className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                      {ROLE_LABEL[role] || role}
                    </p>
                  </div>
                  {role !== 'university' && (
                    <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none">
                      <User size={16} aria-hidden="true" /> Profile
                    </Link>
                  )}
                  <Link to="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none">
                    <Settings size={16} aria-hidden="true" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 border-t border-neutral-200 px-4 py-2.5 text-left text-sm text-error-600 hover:bg-error-50 focus:bg-error-50 focus:outline-none"
                  >
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-modal lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="absolute inset-0 bg-neutral-900/50 animate-fadeIn" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div id="mobile-drawer" className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl animate-slideInLeft">
              <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
                <span className="text-sm font-semibold text-neutral-900">Menu</span>
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); drawerButtonRef.current?.focus(); }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Close navigation menu"
                  autoFocus
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* Page content */}
        <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-4rem)] min-w-0 flex-1 pb-24 outline-none lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-fixed border-t border-neutral-200 bg-white lg:hidden">
        <ul className="flex h-16 items-stretch">
          {bottomTabs.map(({ to, icon: Icon, label, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
                    isActive ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-800'
                  }`
                }
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardLayout;
