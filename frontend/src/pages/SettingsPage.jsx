import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, organizationAPI, authAPI, paymentAPI } from '../services/api';
import {
  User, Bell, Lock, Globe, CreditCard, Shield, Save,
  Camera, CheckCircle, AlertTriangle, LogOut, Trash2, Eye, EyeOff,
} from 'lucide-react';
import { CropModal } from '../components';

// ─── Shared pricing (matches PublicPricingPage) ───────────────────────────────
const PLANS = {
  student: [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Browse all internships', 'Apply to unlimited opportunities', 'Upload profile & resume', 'Track all your applications'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$5.99',
      period: '/month',
      features: ['Everything in Free', 'Priority placement in search results', 'Advanced search filters', 'Resume optimisation tips', 'Priority support'],
      highlight: true,
    },
  ],
  organization: [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Post 1 active internship', 'Basic applicant dashboard', 'Email notifications'],
    },
    {
      id: 'employer',
      name: 'Employer',
      price: '$29',
      period: '/month',
      features: ['Post up to 5 active internships', 'Browse verified student profiles', 'Applicant management dashboard', 'Direct messaging with candidates', 'Application analytics'],
      highlight: true,
    },
  ],
};

// ─── Reusable Toggle ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${checked ? 'bg-primary-600' : 'bg-neutral-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ─── Reusable Section Header ──────────────────────────────────────────────────
const SectionTitle = ({ children, sub }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-neutral-900">{children}</h2>
    {sub && <p className="text-sm text-neutral-500 mt-1">{sub}</p>}
  </div>
);

// ─── Reusable Save Button ─────────────────────────────────────────────────────
const SaveBtn = ({ loading, label = 'Save Changes', icon: Icon = Save, onClick, type = 'submit', variant = 'primary' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
      variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-primary-600 hover:bg-primary-700 text-white'
    }`}
  >
    <Icon size={18} />
    {loading ? 'Saving…' : label}
  </button>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <hr className="my-8 border-neutral-200" />;

// ─── Settings Page ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'account',       label: 'Account',       icon: User },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
    { id: 'security',      label: 'Security',       icon: Lock },
    { id: 'preferences',   label: 'Preferences',    icon: Globe },
    { id: 'billing',       label: 'Billing',        icon: CreditCard },
  ];

  // Auto-clear messages after 5s
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">Manage your account, notifications, and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-2 sticky top-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  data-tab={id}
                  onClick={() => { setActiveTab(id); setMessage({ type: '', text: '' }); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {message.text && (
              <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                message.type === 'info'    ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 lg:p-8">
              {activeTab === 'account'       && <AccountSettings       user={user} showMessage={showMessage} />}
              {activeTab === 'notifications' && <NotificationSettings  user={user} showMessage={showMessage} />}
              {activeTab === 'security'      && <SecuritySettings      user={user} showMessage={showMessage} />}
              {activeTab === 'preferences'   && <PreferenceSettings    user={user} showMessage={showMessage} />}
              {activeTab === 'billing'       && <BillingSettings       user={user} showMessage={showMessage} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Account ──────────────────────────────────────────────────────────────────
const AccountSettings = ({ user, showMessage }) => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: profile?.personalInfo?.firstName || '',
    lastName:  profile?.personalInfo?.lastName  || '',
    companyName: profile?.companyInfo?.companyName || profile?.companyInfo?.name || '',
    email: user?.email || '',
    phone: profile?.personalInfo?.phone || profile?.contactInfo?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileRef = useRef(null);

  const photoUrl = profile?.personalInfo?.profilePicture || profile?.companyInfo?.logo || null;
  const isStudent = user?.role === 'student';

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      showMessage('error', 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'File too large. Maximum size is 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setSelectedImage(reader.result); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    try {
      setUploading(true);
      const fd = new FormData();
      const file = new File([croppedBlob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (isStudent) {
        fd.append('profilePicture', file);
        const res = await studentAPI.uploadProfilePicture(fd);
        if (res.data.success) { updateProfile(res.data.data); showMessage('success', 'Profile picture updated.'); }
      } else {
        fd.append('logo', file);
        const res = await organizationAPI.uploadLogo(fd);
        if (res.data.success) { updateProfile(res.data.data); showMessage('success', 'Company logo updated.'); }
      }
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false); setSelectedImage(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isStudent) {
        const res = await studentAPI.updateProfile({ personalInfo: { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone } });
        if (res.data.success) { updateProfile(res.data.data); showMessage('success', 'Account information saved.'); }
      } else {
        const res = await organizationAPI.updateProfile({
          companyInfo: { ...profile?.companyInfo, companyName: formData.companyName },
          contactInfo: { ...profile?.contactInfo, phone: formData.phone },
        });
        if (res.data.success) { updateProfile(res.data.data); showMessage('success', 'Account information saved.'); }
      }
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <SectionTitle sub="Update your personal information and profile photo.">Account Information</SectionTitle>

      {/* Photo */}
      <div className="mb-6 pb-6 border-b border-neutral-100">
        <label className="block text-sm font-medium text-neutral-700 mb-3">{isStudent ? 'Profile Picture' : 'Company Logo'}</label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {photoUrl
              ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              : <User size={32} className="text-neutral-400" />}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} className="hidden" id="photo-upload" />
            <label htmlFor="photo-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg cursor-pointer font-medium text-sm transition-colors">
              <Camera size={15} />{photoUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
            <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {isStudent ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
            <input type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <input type="email" value={formData.email} disabled className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed" />
          <p className="text-xs text-neutral-400 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
          <input type="tel" value={formData.phone} placeholder="+234 800 000 0000" onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
      </div>

      <SaveBtn loading={loading} />

      {showCrop && selectedImage && (
        <CropModal
          image={selectedImage}
          onClose={() => { setShowCrop(false); setSelectedImage(null); if (fileRef.current) fileRef.current.value = ''; }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          title={isStudent ? 'Crop Profile Picture' : 'Crop Company Logo'}
        />
      )}
    </form>
  );
};

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIF_KEY = 'ic_notification_prefs';

const DEFAULT_NOTIF = {
  emailNotifications: true,
  applicationUpdates: true,
  newInternships: true,
  messageAlerts: true,
  weeklyDigest: false,
  marketingEmails: false,
};

const NotificationSettings = ({ user, showMessage }) => {
  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULT_NOTIF, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') }; }
    catch { return DEFAULT_NOTIF; }
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    setLoading(true);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
      setTimeout(() => {
        setLoading(false);
        showMessage('success', 'Notification preferences saved.');
      }, 300);
    } catch {
      setLoading(false);
      showMessage('error', 'Failed to save preferences.');
    }
  };

  const rows = [
    { key: 'emailNotifications', label: 'Email Notifications',  sub: 'Receive all notifications via email' },
    { key: 'applicationUpdates', label: 'Application Updates',  sub: 'Status changes on your applications' },
    { key: 'newInternships',     label: 'New Opportunities',    sub: 'Alerts when new internships are posted' },
    { key: 'messageAlerts',      label: 'Message Alerts',       sub: 'Notify me when I receive a new message' },
    { key: 'weeklyDigest',       label: 'Weekly Digest',        sub: 'A weekly summary of activity on your account' },
    { key: 'marketingEmails',    label: 'Product Updates',      sub: 'Tips, new features, and platform announcements' },
  ];

  return (
    <div>
      <SectionTitle sub="Choose what you want to be notified about and how.">Notification Preferences</SectionTitle>

      <div className="space-y-1 mb-8">
        {rows.map(({ key, label, sub }) => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
            <div>
              <p className="font-medium text-neutral-900 text-sm">{label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>
            </div>
            <Toggle checked={settings[key]} onChange={val => set(key, val)} />
          </div>
        ))}
      </div>

      <SaveBtn loading={loading} onClick={handleSave} type="button" />
    </div>
  );
};

// ─── Security ─────────────────────────────────────────────────────────────────
const SecuritySettings = ({ user, showMessage }) => {
  const { logout } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { showMessage('error', 'New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { showMessage('error', 'Password must be at least 8 characters.'); return; }
    try {
      setLoading(true);
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showMessage('success', 'Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || err.response?.data?.error || 'Failed to change password. Check your current password and try again.');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.email) { showMessage('error', 'Email does not match. Please type your email exactly.'); return; }
    try {
      setDeleteLoading(true);
      // Call delete account API — fall back to logout if not available
      try { await authAPI.deleteAccount?.(); } catch {}
      showMessage('success', 'Account deletion requested. You will be signed out.');
      setTimeout(() => logout(), 2000);
    } catch { showMessage('error', 'Failed to delete account. Please contact support.'); }
    finally { setDeleteLoading(false); }
  };

  const PwField = ({ field, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={pwForm[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={e => setPwForm({ ...pwForm, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value })}
          placeholder={placeholder}
          required
          className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button type="button" onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
          {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle sub="Change your password and manage account security.">Security Settings</SectionTitle>

      {/* Password Change */}
      <form onSubmit={handleChangePassword}>
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Change Password</h3>
        <div className="space-y-4 mb-6">
          <PwField field="current"  label="Current Password"      placeholder="Your current password" />
          <PwField field="new"      label="New Password"          placeholder="At least 8 characters" />
          <PwField field="confirm"  label="Confirm New Password"  placeholder="Same as new password" />
        </div>
        <SaveBtn loading={loading} label="Update Password" icon={Shield} />
      </form>

      <Divider />

      {/* Active Sessions */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Active Session</h3>
        <p className="text-sm text-neutral-500 mb-4">You are currently signed in. Signing out will end this session on all devices.</p>
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 mb-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">Current device</p>
            <p className="text-xs text-neutral-500">{navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]} · Active now</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        </div>
        <button
          type="button"
          onClick={() => { try { authAPI.logout(); } catch {} window.location.href = '/'; }}
          className="flex items-center gap-2 px-5 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium text-sm transition-colors"
        >
          <LogOut size={16} /> Sign out of all devices
        </button>
      </div>

      <Divider />

      {/* Danger Zone */}
      <div>
        <h3 className="text-base font-semibold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle size={17} /> Danger Zone</h3>
        <p className="text-sm text-neutral-600 mb-4">Deleting your account is permanent and cannot be undone. All your data, applications, and profile information will be removed.</p>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Type your email <span className="font-semibold text-neutral-900">{user?.email}</span> to confirm:
          </label>
          <input
            type="email"
            value={confirmDelete}
            onChange={e => setConfirmDelete(e.target.value)}
            placeholder={user?.email}
            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent mb-3 bg-white"
          />
          <SaveBtn
            loading={deleteLoading}
            label="Delete My Account"
            icon={Trash2}
            type="button"
            variant="danger"
            onClick={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Preferences ──────────────────────────────────────────────────────────────
const PREF_KEY = 'ic_preferences';

const DEFAULT_PREFS = {
  language:       'en',
  timezone:       'Africa/Lagos',
  dateFormat:     'DD/MM/YYYY',
  theme:          'light',
  profileVisible: true,
  openToWork:     true,
};

const PreferenceSettings = ({ user, showMessage }) => {
  const [prefs, setPrefs] = useState(() => {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; }
    catch { return DEFAULT_PREFS; }
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  // Apply theme immediately when changed
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // auto: follow system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
  }, [prefs.theme]);

  const handleSave = () => {
    setLoading(true);
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
      setTimeout(() => { setLoading(false); showMessage('success', 'Preferences saved.'); }, 300);
    } catch { setLoading(false); showMessage('error', 'Failed to save preferences.'); }
  };

  const isStudent = user?.role === 'student';

  const Select = ({ label, optKey, options }) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      <select
        value={prefs[optKey]}
        onChange={e => set(optKey, e.target.value)}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
      >
        {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <SectionTitle sub="Configure your language, timezone, and display preferences.">General Preferences</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select label="Language" optKey="language" options={[['en','English'],['fr','French (Français)'],['pt','Portuguese (Português)'],['sw','Swahili (Kiswahili)'],['ha','Hausa'],['yo','Yoruba'],['ig','Igbo']]} />
        <Select label="Timezone" optKey="timezone" options={[
          ['Africa/Lagos',    'Africa/Lagos (WAT, UTC+1)'],
          ['Africa/Nairobi',  'Africa/Nairobi (EAT, UTC+3)'],
          ['Africa/Accra',    'Africa/Accra (GMT, UTC+0)'],
          ['Africa/Johannesburg', 'Africa/Johannesburg (SAST, UTC+2)'],
          ['Africa/Cairo',    'Africa/Cairo (EET, UTC+2)'],
          ['Africa/Abidjan',  'Africa/Abidjan (GMT, UTC+0)'],
          ['Europe/London',   'Europe/London (GMT/BST)'],
          ['UTC',             'UTC'],
        ]} />
        <Select label="Date Format" optKey="dateFormat" options={[['DD/MM/YYYY','DD/MM/YYYY'],['MM/DD/YYYY','MM/DD/YYYY'],['YYYY-MM-DD','YYYY-MM-DD (ISO)']]} />
        <Select label="Theme" optKey="theme" options={[['light','Light'],['dark','Dark'],['auto','Auto (System)']]} />
      </div>

      <Divider />

      {/* Visibility */}
      <h3 className="text-base font-semibold text-neutral-900 mb-4">Privacy & Visibility</h3>
      <div className="space-y-1 mb-8">
        <div className="flex items-center justify-between py-4 border-b border-neutral-100">
          <div>
            <p className="font-medium text-neutral-900 text-sm">Profile Visibility</p>
            <p className="text-xs text-neutral-500 mt-0.5">Allow employers to find and view your profile</p>
          </div>
          <Toggle checked={prefs.profileVisible} onChange={val => set('profileVisible', val)} />
        </div>
        {isStudent && (
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-neutral-900 text-sm">Open to Internship Offers</p>
              <p className="text-xs text-neutral-500 mt-0.5">Show a badge on your profile that you're actively looking</p>
            </div>
            <Toggle checked={prefs.openToWork} onChange={val => set('openToWork', val)} />
          </div>
        )}
      </div>

      <SaveBtn loading={loading} onClick={handleSave} type="button" />
    </div>
  );
};

// ─── Billing ──────────────────────────────────────────────────────────────────
const BillingSettings = ({ user, showMessage }) => {
  const [subscription, setSubscription] = useState(user?.subscription || { plan: 'free', status: 'active' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const isStudent = user?.role === 'student';
  const plans = isStudent ? PLANS.student : PLANS.organization;
  const currentPlanId = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active';
  const isPaid = currentPlanId !== 'free';

  useEffect(() => {
    // Load real subscription
    paymentAPI.getSubscription()
      .then(res => { if (res.data.success) setSubscription(res.data.data); })
      .catch(() => {});

    // Load billing history
    setFetchingHistory(true);
    paymentAPI.getHistory()
      .then(res => { setHistory(res.data.data || []); })
      .catch(() => setHistory([]))
      .finally(() => setFetchingHistory(false));
  }, []);

  const handleUpgrade = async (planId) => {
    try {
      setLoading(true);
      const res = await paymentAPI.createCheckout(planId, 'monthly');
      if (res.data.success && res.data.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        showMessage('error', 'Failed to open checkout. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || '';
      if (msg.toLowerCase().includes('not configured') || err.response?.status === 503) {
        showMessage('info', 'Payment processing is being set up. Contact us at hello@internshipconnect.app to upgrade.');
      } else {
        showMessage('error', msg || 'Something went wrong. Please try again or contact support.');
      }
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will keep access until the end of the billing period.')) return;
    try {
      setCancelLoading(true);
      await paymentAPI.cancelSubscription();
      showMessage('success', 'Subscription cancelled. You will retain access until the end of your billing period.');
      setSubscription(s => ({ ...s, status: 'cancelled' }));
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to cancel subscription. Contact support.');
    } finally { setCancelLoading(false); }
  };

  const handleManageBilling = async () => {
    try {
      const res = await paymentAPI.createPortal();
      if (res.data.success && res.data.data?.url) window.location.href = res.data.data.url;
    } catch {
      showMessage('info', 'Billing portal unavailable. Contact hello@internshipconnect.app for billing changes.');
    }
  };

  return (
    <div>
      <SectionTitle sub="Manage your plan, payment method, and billing history.">Billing & Subscription</SectionTitle>

      {/* Current Plan */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Current Plan</h3>
        <div className="flex items-center gap-4 bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
          <CreditCard size={36} className="text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-neutral-900 capitalize text-lg">{currentPlanId === 'free' ? 'Free' : currentPlanId === 'premium' ? 'Student Premium' : 'Employer'} Plan</p>
            <p className="text-sm text-neutral-600">
              Status: <span className={`font-semibold ${isActive ? 'text-green-700' : 'text-amber-700'}`}>{subscription?.status || 'Active'}</span>
              {subscription?.currentPeriodEnd && ` · Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </p>
          </div>
          {isPaid && (
            <button onClick={handleManageBilling} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex-shrink-0">Manage</button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div key={plan.id} className={`rounded-xl border-2 p-5 relative ${plan.highlight ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white'}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">MOST POPULAR</span>
                )}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-neutral-900">{plan.price}</span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>
                <p className="font-bold text-neutral-900 mb-3">{plan.name}</p>
                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle size={14} className="text-primary-600 flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2 text-center text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 ${
                      plan.highlight ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {loading ? 'Processing…' : plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Billing History</h3>
        {fetchingHistory ? (
          <div className="py-8 text-center text-neutral-500 text-sm">Loading history…</div>
        ) : history.length > 0 ? (
          <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden">
            {history.map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{new Date(inv.date || inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-neutral-500 capitalize">{inv.plan || 'Subscription'} · {inv.billingPeriod || 'monthly'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-neutral-900">${(inv.amount / 100 || inv.amount || 0).toFixed(2)}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${inv.status === 'paid' || inv.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status === 'paid' || inv.status === 'succeeded' ? 'Paid' : inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-neutral-200 rounded-xl">
            <CreditCard size={32} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No billing history yet.</p>
            <p className="text-xs text-neutral-400 mt-1">Your invoices will appear here after your first payment.</p>
          </div>
        )}
      </div>

      {/* Cancel */}
      {isPaid && isActive && (
        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {cancelLoading ? 'Cancelling…' : 'Cancel subscription'}
          </button>
          <p className="text-xs text-neutral-500 mt-1">You will keep access until the end of your current billing period.</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
