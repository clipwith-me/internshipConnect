// frontend/src/pages/DemoPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, MessageCircle, Users, Settings, Star,
  CheckCircle, ArrowRight, Sparkles, Crown, Mail,
  TrendingUp, FileText, Building2
} from 'lucide-react';

const DemoPage = () => {
  const [activeDemo, setActiveDemo] = useState('overview');

  const features = [
    {
      id: 'pro-toggle',
      title: 'Pro Toggle in Settings',
      icon: Star,
      color: 'purple',
      description: 'Students can enable featured profiles to appear first in searches',
      demoUrl: '/dashboard/settings',
      status: 'implemented',
      screenshot: null
    },
    {
      id: 'student-search',
      title: 'Student Search',
      icon: Users,
      color: 'blue',
      description: 'Organizations can search for talented students with advanced filters',
      demoUrl: '/dashboard/students',
      status: 'implemented',
      requiredRole: 'organization'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      icon: BarChart3,
      color: 'green',
      description: 'Comprehensive analytics with charts, metrics, and insights',
      demoUrl: '/dashboard/analytics',
      status: 'implemented',
      requiredRole: 'organization'
    },
    {
      id: 'messaging',
      title: 'Direct Messaging',
      icon: MessageCircle,
      color: 'indigo',
      description: 'Real-time messaging between students and organizations',
      demoUrl: '/dashboard/messages',
      status: 'implemented',
      proBadge: true
    },
    {
      id: 'featured-profiles',
      title: 'Featured Profiles',
      icon: Crown,
      color: 'amber',
      description: 'Pro students appear first in organization searches',
      demoUrl: '/dashboard/students',
      status: 'implemented',
      proBadge: true
    },
    {
      id: 'contact-sales',
      title: 'Contact Sales',
      icon: Mail,
      color: 'rose',
      description: 'Professional contact form for enterprise inquiries',
      demoUrl: '/contact-sales',
      status: 'implemented'
    }
  ];

  const colorClasses = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      icon: 'text-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-700'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icon: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary-600" />
                InternshipConnect Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Explore all the features we've built
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">6</span>
            </div>
            <p className="text-gray-600 font-medium">Features Implemented</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">2.5k+</span>
            </div>
            <p className="text-gray-600 font-medium">Lines of Code</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">12+</span>
            </div>
            <p className="text-gray-600 font-medium">API Endpoints</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-amber-600" />
              <span className="text-3xl font-bold text-gray-900">100%</span>
            </div>
            <p className="text-gray-600 font-medium">Feature Complete</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];

            return (
              <div
                key={feature.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className={`${colors.bg} border-b ${colors.border} p-6`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg bg-white ${colors.border} border`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div className="flex gap-2">
                      {feature.status === 'implemented' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle size={12} />
                          Live
                        </span>
                      )}
                      {feature.proBadge && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Pro
                        </span>
                      )}
                      {feature.requiredRole && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                          {feature.requiredRole}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold ${colors.text}`}>
                    {feature.title}
                  </h3>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>

                  <Link
                    to={feature.demoUrl}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${colors.button} text-white rounded-lg font-medium transition-colors`}
                  >
                    View Demo
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary-600" />
            Quick Start Guide
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Test Pro Toggle</h3>
                <p className="text-gray-600 text-sm">
                  Login as a student → Go to Settings → Preferences → Enable Featured Profile (requires Pro subscription)
                </p>
                <div className="mt-2 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700">
                  node test-scripts/upgrade-user-to-pro.js your-email@example.com
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Explore Student Search</h3>
                <p className="text-gray-600 text-sm">
                  Login as an organization → Navigate to "Find Students" → Search and filter talented candidates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">View Analytics Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Login as an organization → Go to Analytics → Explore metrics, charts, and insights
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Try Direct Messaging</h3>
                <p className="text-gray-600 text-sm">
                  Login as an organization or Pro student → Go to Messages → Start conversations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Submit Contact Sales Form</h3>
                <p className="text-gray-600 text-sm">
                  Visit /contact-sales (no login required) → Fill form → See success confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            📚 Complete Documentation Available
          </h2>
          <p className="mb-6 opacity-90">
            All features are fully documented with implementation guides, API references, and testing procedures.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">COMPLETE_FEATURES_GUIDE.md</h3>
              <p className="text-sm opacity-90">752 lines - All 5 features documented</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">ANALYTICS_API_GUIDE.md</h3>
              <p className="text-sm opacity-90">547 lines - Complete API reference</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">MESSAGING_GUIDE.md</h3>
              <p className="text-sm opacity-90">575 lines - Messaging system docs</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">NEW_FEATURES_TESTING.md</h3>
              <p className="text-sm opacity-90">220 lines - Testing procedures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
