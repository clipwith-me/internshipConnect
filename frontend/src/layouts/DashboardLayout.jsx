// frontend/src/layouts/DashboardLayout.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Briefcase,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Search,
  ChevronDown,
  CreditCard,
  MessageCircle,
  BarChart3,
  Users,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { Badge, NotificationBell } from '../components';

/**
 * 🎓 LEARNING: Dashboard Layout
 * 
 * Main layout for authenticated users (students and organizations).
 * 
 * Features:
 * - Top navigation bar with logo and user menu
 * - Sidebar navigation (collapsible on mobile)
 * - Main content area
 * - Notification indicator
 * - User profile dropdown
 * - Responsive design
 */

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuFocusIndex, setMenuFocusIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, profile, loading, logout } = useAuth();
  const userMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Handle search submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/internships?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  // Handle search input with Enter key
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }, [handleSearch]);

  // ✅ SECURITY FIX: Wait for user to be loaded - don't assume a default role
  // This prevents showing wrong navigation items during initial load
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Derive display name from profile (firstName + lastName) which updates in real-time
  // This ensures the header updates immediately when user saves profile changes
  const getDisplayName = () => {
    if (user.role === 'student' && profile?.personalInfo) {
      const { firstName, lastName } = profile.personalInfo;
      if (firstName || lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim();
      }
    } else if (user.role === 'organization' && profile?.companyInfo?.name) {
      return profile.companyInfo.name;
    }
    return user.name || user.email?.split('@')[0] || 'User';
  };

  // Get profile picture URL from profile
  const getAvatarUrl = () => {
    if (user.role === 'student') {
      return profile?.personalInfo?.profilePicture || null;
    } else if (user.role === 'organization') {
      return profile?.companyInfo?.logo || null;
    }
    return null;
  };

  const displayUser = {
    name: getDisplayName(),
    email: user.email || '',
    role: user.role,
    avatar: getAvatarUrl(),
    notifications: 0,
  };

  // Memoized handlers to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prev => !prev);
    setMenuFocusIndex(-1);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Keyboard navigation for dropdown menu (accessibility)
  const handleMenuKeyDown = useCallback((e) => {
    const menuItems = userMenuRef.current?.querySelectorAll('button[role="menuitem"]');
    if (!menuItems) return;

    switch (e.key) {
      case 'Escape':
        setUserMenuOpen(false);
        menuButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setMenuFocusIndex(prev => Math.min(prev + 1, menuItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMenuFocusIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setMenuFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setMenuFocusIndex(menuItems.length - 1);
        break;
      default:
        break;
    }
  }, []);

  // Focus menu item when index changes
  useEffect(() => {
    if (menuFocusIndex >= 0 && userMenuOpen) {
      const menuItems = userMenuRef.current?.querySelectorAll('button[role="menuitem"]');
      menuItems?.[menuFocusIndex]?.focus();
    }
  }, [menuFocusIndex, userMenuOpen]);
  
  // Navigation items based on role
  const studentNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Internships' },
    { to: '/dashboard/applications', icon: FileText, label: 'My Applications' },
    { to: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
    { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages', badge: 'Pro' },
    { to: '/dashboard/resumes', icon: FileText, label: 'Resumes' },
    { to: '/dashboard/referrals', icon: Users, label: 'Refer a Friend' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/pricing', icon: CreditCard, label: 'Pricing' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  // Bottom tabs for mobile (first 4 most important + More)
  const studentBottomTabs = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Search' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applied' },
    { to: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const organizationNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/dashboard/my-internships', icon: Briefcase, label: 'My Internships' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
    { to: '/dashboard/students', icon: Users, label: 'Find Students' },
    { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/verification', icon: Settings, label: 'Verification' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/pricing', icon: CreditCard, label: 'Pricing' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const orgBottomTabs = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/dashboard/my-internships', icon: Briefcase, label: 'Listings' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applicants' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/dashboard/admin', icon: Settings, label: 'Admin Panel' },
    { to: '/dashboard/founder', icon: BarChart3, label: 'Founder Dashboard' },
    { to: '/dashboard/investor', icon: CreditCard, label: 'Investor View' },
    { to: '/dashboard/internships', icon: Briefcase, label: 'Internships' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applications' },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const bottomTabs = displayUser.role === 'student' ? studentBottomTabs : orgBottomTabs;

  const navItems = displayUser.role === 'admin' ? adminNavItems
    : displayUser.role === 'student' ? studentNavItems
    : organizationNavItems;

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    setUserMenuOpen(false);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation Bar - Microsoft Style */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 p-2 rounded-md transition-colors"
                aria-label={sidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo - Microsoft Style: Left-aligned, moderate size, clickable */}
              <a href="/dashboard" className="flex items-center py-2 group">
                <img
                  src="/logo-primary.png"
                  alt="InternshipConnect"
                  className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
                  onError={(e) => { e.target.src = '/logo-icon.png'; }}
                />
              </a>
            </div>
            
            {/* Search bar (desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search internships"
                />
              </div>
            </form>
            
            {/* Right side - Notifications and User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative" ref={userMenuRef} onKeyDown={handleMenuKeyDown}>
                <button
                  ref={menuButtonRef}
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-100 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium overflow-hidden">
                    {displayUser?.avatar ? (
                      <img
                        src={displayUser.avatar}
                        alt={displayUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayUser?.name?.charAt(0) || 'G'
                    )}
                  </div>

                  {/* Name (desktop only) */}
                  <span className="hidden md:block text-sm font-medium text-neutral-700">
                    {displayUser?.name || 'Guest'}
                  </span>
                  
                  <ChevronDown size={16} className="text-neutral-400" />
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-slideInTop"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-2 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">{displayUser?.name || 'Guest'}</p>
                      <p className="text-xs text-neutral-500">{displayUser?.email || 'guest@example.com'}</p>
                    </div>

                    <button
                      role="menuitem"
                      onClick={() => handleNavigate('/dashboard/profile')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                      tabIndex={-1}
                    >
                      <User size={16} aria-hidden="true" />
                      Profile
                    </button>

                    <button
                      role="menuitem"
                      onClick={() => handleNavigate('/dashboard/settings')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                      tabIndex={-1}
                    >
                      <Settings size={16} aria-hidden="true" />
                      Settings
                    </button>

                    <div className="border-t border-neutral-200 my-1" role="separator" />

                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 focus:bg-error-50 focus:outline-none"
                      tabIndex={-1}
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)]
            w-72 sm:w-64 bg-white border-r border-neutral-200
            transition-transform duration-200 ease-in-out z-40
            flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Scrollable nav area */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer — hidden on very small heights */}
          <div className="shrink-0 p-3 border-t border-neutral-200 hidden sm:block">
            <div className="bg-primary-50 rounded-lg p-3">
              <h4 className="font-semibold text-primary-900 text-sm mb-1">
                Upgrade to Premium
              </h4>
              <p className="text-xs text-primary-700 mb-2 leading-snug">
                Upgrade to Premium — unlock advanced features and priority support
              </p>
              <button
                onClick={() => { setSidebarOpen(false); navigate('/dashboard/pricing'); }}
                className="w-full px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-auto pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
        <div className="flex items-stretch h-16">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                    isActive
                      ? 'text-amber-600'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-50' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;

/**
 * 🎓 USAGE IN ROUTING:
 * 
 * // In your router setup (App.jsx or routes.jsx)
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import DashboardLayout from './layouts/DashboardLayout';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         <Route path="/" element={<DashboardLayout />}>
 *           <Route index element={<DashboardPage />} />
 *           <Route path="internships" element={<InternshipsPage />} />
 *           <Route path="applications" element={<ApplicationsPage />} />
 *           <Route path="resumes" element={<ResumesPage />} />
 *           <Route path="settings" element={<SettingsPage />} />
 *         </Route>
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 * 
 * // The <Outlet /> in DashboardLayout will render the nested route content
 */