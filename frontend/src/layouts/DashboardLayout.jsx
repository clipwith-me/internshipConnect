// frontend/src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Badge } from '../components';

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
  const navigate = useNavigate();
  
  // Mock user data (replace with actual auth context)
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    avatar: null,
    notifications: 3,
  };
  
  // Navigation items based on role
  const studentNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/internships', icon: Briefcase, label: 'Internships' },
    { to: '/applications', icon: FileText, label: 'My Applications' },
    { to: '/resumes', icon: FileText, label: 'Resumes' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const organizationNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/internships', icon: Briefcase, label: 'My Internships' },
    { to: '/applications', icon: FileText, label: 'Applications' },
    { to: '/analytics', icon: FileText, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const navItems = user.role === 'student' ? studentNavItems : organizationNavItems;
  
  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-neutral-600 hover:text-neutral-900 p-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-primary-500">
                  InternshipConnect
                </h1>
              </div>
            </div>
            
            {/* Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search internships..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Right side - Notifications and User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                <Bell size={20} />
                {user.notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium">
                    {user.name.charAt(0)}
                  </div>
                  
                  {/* Name (desktop only) */}
                  <span className="hidden md:block text-sm font-medium text-neutral-700">
                    {user.name}
                  </span>
                  
                  <ChevronDown size={16} className="text-neutral-400" />
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-slideInTop">
                    <div className="px-4 py-2 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    
                    <div className="border-t border-neutral-200 my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                    >
                      <LogOut size={16} />
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
            w-64 bg-white border-r border-neutral-200
            transition-transform duration-200 ease-in-out z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="font-semibold text-primary-900 mb-1">
                Upgrade to Premium
              </h4>
              <p className="text-xs text-primary-700 mb-3">
                Get unlimited AI resume generations and priority applications
              </p>
              <button className="w-full px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors">
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
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-auto">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
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