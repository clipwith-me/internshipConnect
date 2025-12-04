// frontend/src/pages/SettingsPage.jsx
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, organizationAPI, authAPI, paymentAPI } from '../services/api';
import { User, Bell, Lock, Globe, CreditCard, Shield, Save, Camera, Upload } from 'lucide-react';
import { CropModal } from '../components';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard, premium: true },
  ];

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.premium && (
                      <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        Premium
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {activeTab === 'account' && (
                <AccountSettings user={user} setMessage={setMessage} />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings user={user} setMessage={setMessage} />
              )}
              {activeTab === 'security' && (
                <SecuritySettings user={user} setMessage={setMessage} />
              )}
              {activeTab === 'preferences' && (
                <PreferenceSettings user={user} setMessage={setMessage} />
              )}
              {activeTab === 'billing' && (
                <BillingSettings user={user} setMessage={setMessage} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettings = ({ user, setMessage }) => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: profile?.personalInfo?.firstName || profile?.companyInfo?.name || '',
    lastName: profile?.personalInfo?.lastName || '',
    email: user?.email || '',
    phone: profile?.personalInfo?.phone || profile?.contactInfo?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Get current profile picture URL
  const profilePictureUrl = profile?.personalInfo?.profilePicture || profile?.companyInfo?.logo || null;

  // ✅ FIX: Open crop modal instead of uploading directly
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.' });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 2MB.' });
      return;
    }

    // Convert file to data URL for crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // ✅ NEW: Upload cropped image
  const handleCropComplete = async (croppedBlob) => {
    try {
      setUploading(true);
      const uploadFormData = new FormData();

      // Create file from blob
      const fileName = `profile_${Date.now()}.jpg`;
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });

      if (user?.role === 'student') {
        uploadFormData.append('profilePicture', croppedFile);
        const response = await studentAPI.uploadProfilePicture(uploadFormData);
        if (response.data.success) {
          updateProfile(response.data.data);
          setMessage({ type: 'success', text: '✅ Profile picture updated successfully!' });
        }
      } else if (user?.role === 'organization') {
        uploadFormData.append('logo', croppedFile);
        const response = await organizationAPI.uploadLogo(uploadFormData);
        if (response.data.success) {
          updateProfile(response.data.data);
          setMessage({ type: 'success', text: '✅ Company logo updated successfully!' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload image' });
    } finally {
      setUploading(false);
      setSelectedImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Build the update data based on role
      let updateData;
      if (user?.role === 'student') {
        updateData = {
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          }
        };
        const response = await studentAPI.updateProfile(updateData);
        if (response.data.success) {
          updateProfile(response.data.data);
          setMessage({ type: 'success', text: 'Account settings updated successfully' });
        }
      } else if (user?.role === 'organization') {
        updateData = {
          companyInfo: {
            ...profile?.companyInfo,
            name: formData.firstName, // Using firstName field for company name
          },
          contactInfo: {
            ...profile?.contactInfo,
            phone: formData.phone,
          }
        };
        const response = await organizationAPI.updateProfile(updateData);
        if (response.data.success) {
          updateProfile(response.data.data);
          setMessage({ type: 'success', text: 'Account settings updated successfully' });
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update settings' });
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <form onSubmit={handleSave}>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Account Information</h2>

      {/* Profile Picture Upload */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          {isStudent ? 'Profile Picture' : 'Company Logo'}
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden flex items-center justify-center">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-neutral-400" />
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors cursor-pointer font-medium text-sm"
            >
              <Camera size={16} />
              {profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
            <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP, or GIF. Max 2MB.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {isStudent ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
          />
          <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
          <input
            type="text"
            value={user?.role || 'student'}
            disabled
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Save size={20} />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* ✅ NEW: Crop Modal */}
      {showCropModal && selectedImage && (
        <CropModal
          image={selectedImage}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImage(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          title={isStudent ? 'Crop Profile Picture' : 'Crop Company Logo'}
        />
      )}
    </form>
  );
};

const NotificationSettings = ({ user, setMessage }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newInternships: true,
    weeklyDigest: false,
    marketingEmails: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // API call would go here
      setMessage({ type: 'success', text: 'Notification preferences updated' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Notification Preferences</h2>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between py-3 border-b border-neutral-200">
          <div>
            <p className="font-medium text-neutral-900">Email Notifications</p>
            <p className="text-sm text-neutral-600">Receive notifications via email</p>
          </div>
          <Toggle
            checked={settings.emailNotifications}
            onChange={(val) => setSettings({ ...settings, emailNotifications: val })}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-neutral-200">
          <div>
            <p className="font-medium text-neutral-900">Application Updates</p>
            <p className="text-sm text-neutral-600">Get notified about application status changes</p>
          </div>
          <Toggle
            checked={settings.applicationUpdates}
            onChange={(val) => setSettings({ ...settings, applicationUpdates: val })}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-neutral-200">
          <div>
            <p className="font-medium text-neutral-900">New Internships</p>
            <p className="text-sm text-neutral-600">Alerts for internships matching your profile</p>
          </div>
          <Toggle
            checked={settings.newInternships}
            onChange={(val) => setSettings({ ...settings, newInternships: val })}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-neutral-200">
          <div>
            <p className="font-medium text-neutral-900">Weekly Digest</p>
            <p className="text-sm text-neutral-600">Weekly summary of activities</p>
          </div>
          <Toggle
            checked={settings.weeklyDigest}
            onChange={(val) => setSettings({ ...settings, weeklyDigest: val })}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-neutral-900">Marketing Emails</p>
            <p className="text-sm text-neutral-600">Tips, features, and product updates</p>
          </div>
          <Toggle
            checked={settings.marketingEmails}
            onChange={(val) => setSettings({ ...settings, marketingEmails: val })}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Save size={20} />
        Save Preferences
      </button>
    </div>
  );
};

const SecuritySettings = ({ user, setMessage }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setLoading(true);
      // ✅ FIX: Send correct payload structure
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Security Settings</h2>

      <form onSubmit={handleChangePassword}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Shield size={20} />
          Change Password
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Two-Factor Authentication</h3>
        <p className="text-sm text-neutral-600 mb-4">
          Add an extra layer of security to your account
        </p>
        <button
          onClick={() => setMessage({ type: 'info', text: '2FA functionality will be available in the next update. We recommend using a strong password and enabling account recovery options.' })}
          className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Enable 2FA (Coming Soon)
        </button>
        <p className="text-xs text-neutral-500 mt-2">
          2FA with authenticator apps (Google Authenticator, Authy) is coming soon
        </p>
      </div>
    </div>
  );
};

const PreferenceSettings = ({ user, setMessage }) => {
  const { profile } = useAuth();
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
  });
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(profile?.featured?.isFeatured || false);

  const handleSave = async () => {
    try {
      setLoading(true);
      // API call would go here
      setMessage({ type: 'success', text: 'Preferences updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedToggle = async (newValue) => {
    try {
      setFeaturedLoading(true);
      const response = await studentAPI.toggleFeatured(newValue);

      if (response.data.success) {
        setIsFeatured(newValue);
        setMessage({
          type: 'success',
          text: response.data.message
        });
      }
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to update featured status';
      const requiredPlan = err.response?.data?.requiredPlan;

      if (requiredPlan) {
        setMessage({
          type: 'error',
          text: `${error}. Please upgrade to ${requiredPlan.toUpperCase()} to use this feature.`
        });
      } else {
        setMessage({ type: 'error', text: error });
      }
    } finally {
      setFeaturedLoading(false);
    }
  };

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        checked ? 'bg-primary-600' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const isStudent = user?.role === 'student';
  const hasPro = user?.subscription?.plan === 'pro' && user?.subscription?.status === 'active';

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">General Preferences</h2>

      {/* Pro Features Section for Students */}
      {isStudent && (
        <div className="mb-8 pb-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            Featured Profile
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              Pro
            </span>
          </h3>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-neutral-900 mb-1">
                  Boost Your Profile Visibility
                </p>
                <p className="text-sm text-neutral-600 mb-3">
                  Featured profiles appear at the top of organization searches, increasing your chances of being discovered by employers.
                </p>
                {hasPro ? (
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={isFeatured}
                      onChange={handleFeaturedToggle}
                      disabled={featuredLoading}
                    />
                    <span className="text-sm font-medium text-neutral-700">
                      {featuredLoading ? 'Updating...' : isFeatured ? 'Featured (Active)' : 'Not Featured'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600">
                      Upgrade to Pro to enable featured profile
                    </span>
                    <a
                      href="/dashboard/settings"
                      onClick={(e) => {
                        e.preventDefault();
                        // Switch to billing tab
                        const billingTab = document.querySelector('[data-tab="billing"]');
                        if (billingTab) billingTab.click();
                      }}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Upgrade Now
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Save size={20} />
        Save Preferences
      </button>
    </div>
  );
};

const BillingSettings = ({ user, setMessage }) => {
  const subscription = user?.subscription || { plan: 'free', status: 'active' };
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan = 'premium', billingPeriod = 'monthly') => {
    try {
      setLoading(true);
      const response = await paymentAPI.createCheckout(plan, billingPeriod);

      if (response.data.success && response.data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data.url;
      } else {
        setMessage({ type: 'error', text: 'Failed to create checkout session' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Payment system temporarily unavailable';

      // Check if Stripe is not configured
      if (errorMessage.includes('not configured') || errorMessage.includes('Payment') || err.response?.status === 503) {
        setMessage({ type: 'info', text: 'Payment processing is being set up. Please check back soon or contact support.' });
      } else {
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">Billing & Subscription</h2>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 capitalize">
              {subscription.plan} Plan
            </h3>
            <p className="text-sm text-neutral-600">
              Status: <span className="font-medium capitalize">{subscription.status}</span>
            </p>
          </div>
          <CreditCard className="w-12 h-12 text-primary-600" />
        </div>

        {subscription.plan === 'free' || subscription.plan === 'basic' ? (
          <button
            onClick={() => handleUpgrade('premium', 'monthly')}
            disabled={loading}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Upgrade to Premium'}
          </button>
        ) : null}
      </div>

      {subscription.plan !== 'free' && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Method</h3>
            <div className="border border-neutral-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-neutral-200 rounded flex items-center justify-center">
                  <CreditCard size={20} className="text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-neutral-600">Expires 12/25</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Update
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Billing History</h3>
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
              {[
                { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid' },
                { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid' },
                { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid' },
              ].map((invoice, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{invoice.date}</p>
                    <p className="text-sm text-neutral-600">{invoice.amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {invoice.status}
                    </span>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="text-red-600 hover:text-red-700 font-medium">
            Cancel Subscription
          </button>
        </>
      )}
    </div>
  );
};

export default SettingsPage;
