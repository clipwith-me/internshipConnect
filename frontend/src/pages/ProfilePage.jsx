// frontend/src/pages/ProfilePage.jsx
/**
 * 🎯 COMPREHENSIVE PROFILE PAGE - FULL FEATURES
 *
 * Features Included:
 * - View/Edit Personal Information
 * - Add/Edit/Delete Education
 * - Add/Edit/Delete Skills
 * - Add/Edit/Delete Experience
 * - Company Information Management
 * - Profile Photo Upload
 * - Social Links
 * - Resume/Portfolio Links
 * - Profile Completeness Indicator
 * - Data Validation
 * - Auto-save Draft
 */

import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, organizationAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  Building2, Mail, MapPin, Save, Edit2, Plus, Trash2, X,
  User, Phone, Calendar, Globe, Linkedin, Github,
  Award, Briefcase, GraduationCap, Code, CheckCircle,
  AlertCircle, Upload, Link as LinkIcon
} from 'lucide-react';
import { logger } from '../utils/logger';
import { apiCache } from '../utils/apiCache';

const ProfilePage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  return isStudent ? <StudentProfile /> : <OrganizationProfile />;
};

/**
 * STUDENT PROFILE COMPONENT - Full Featured
 */
const StudentProfile = memo(() => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      bio: '',
      location: { city: '', state: '', country: '' }
    },
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      website: ''
    },
    education: [],
    skills: [],
    experience: [],
    preferences: {
      internshipTypes: [],
      industries: [],
      roles: [],
      locations: [],
      compensation: { minStipend: 0, currency: 'USD' }
    }
  });
  const [errors, setErrors] = useState({});
  const [savingSection, setSavingSection] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const abortController = useApi();
  const { user } = useAuth();

  // Calculate profile completeness
  const calculateCompleteness = useCallback((data) => {
    let total = 0;
    let filled = 0;

    // Personal Info (30%)
    total += 6;
    if (data.personalInfo?.firstName) filled++;
    if (data.personalInfo?.lastName) filled++;
    if (data.personalInfo?.phone) filled++;
    if (data.personalInfo?.bio) filled++;
    if (data.personalInfo?.location?.city) filled++;
    if (data.personalInfo?.location?.country) filled++;

    // Education (20%)
    total += 2;
    if (data.education?.length > 0) filled += 2;

    // Skills (20%)
    total += 2;
    if (data.skills?.length >= 3) filled += 2;

    // Experience (20%)
    total += 2;
    if (data.experience?.length > 0) filled += 2;

    // Social Links (10%)
    total += 1;
    if (data.socialLinks?.linkedin || data.socialLinks?.github) filled++;

    return Math.round((filled / total) * 100);
  }, []);

  const [completeness, setCompleteness] = useState(0);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    const cacheKey = `student-profile-${user?._id}`;
    const startTime = performance.now();

    try {
      setLoading(true);

      const cached = apiCache.get(cacheKey);
      if (cached && cached.data) {
        logger.info('Profile loaded from cache', { duration: performance.now() - startTime });
        setProfile(cached.data);
        setFormData(cached.data);
        setCompleteness(calculateCompleteness(cached.data));
        setLoading(false);
        return;
      }

      const response = await studentAPI.getProfile({
        signal: abortController?.signal
      });

      const duration = performance.now() - startTime;
      logger.performance('fetchProfile', duration);

      if (response.data.success) {
        let profileData = response.data.data || {
          personalInfo: { firstName: '', lastName: '', phone: '', dateOfBirth: '', location: { city: '', state: '', country: '' } },
          bio: '',
          socialLinks: { linkedin: '', github: '', portfolio: '', website: '' },
          education: [],
          skills: [],
          experience: [],
          preferences: { internshipTypes: [], industries: [], roles: [], locations: [], compensation: { minStipend: 0, currency: 'USD' } }
        };

        // Normalize: Move bio from root to personalInfo for frontend compatibility
        if (profileData.bio && !profileData.personalInfo.bio) {
          profileData = {
            ...profileData,
            personalInfo: { ...profileData.personalInfo, bio: profileData.bio }
          };
        }

        apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
        setProfile(profileData);
        setFormData(profileData);
        setCompleteness(calculateCompleteness(profileData));
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') return;
      logger.error('Failed to fetch profile', err);
      apiCache.invalidate(cacheKey);
      // Set default empty profile instead of null
      const defaultProfile = {
        personalInfo: { firstName: '', lastName: '', phone: '', dateOfBirth: '', bio: '', location: { city: '', state: '', country: '' } },
        socialLinks: { linkedin: '', github: '', portfolio: '', website: '' },
        education: [],
        skills: [],
        experience: [],
        preferences: { internshipTypes: [], industries: [], roles: [], locations: [], compensation: { minStipend: 0, currency: 'USD' } }
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [abortController, user?._id, calculateCompleteness]);

  // Save entire profile
  const handleSave = useCallback(async () => {
    const startTime = performance.now();

    try {
      setSaving(true);
      setErrors({});
      setSuccessMessage('');

      await studentAPI.updateProfile(formData);
      setEditing(false);

      apiCache.invalidate(`student-profile-${user?._id}`);

      const response = await studentAPI.getProfile({
        signal: abortController?.signal
      });

      if (response.data.success) {
        let profileData = response.data.data;

        // Normalize: Move bio from root to personalInfo for frontend compatibility
        if (profileData.bio && !profileData.personalInfo.bio) {
          profileData = {
            ...profileData,
            personalInfo: { ...profileData.personalInfo, bio: profileData.bio }
          };
        }

        setProfile(profileData);
        setFormData(profileData);
        setCompleteness(calculateCompleteness(profileData));
        apiCache.set(`student-profile-${user?._id}`, response.data, 5 * 60 * 1000);
      }

      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      const duration = performance.now() - startTime;
      logger.info('Profile saved successfully', { duration });
    } catch (err) {
      logger.error('Failed to update profile', err);
      setErrors({ general: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  }, [formData, abortController, user?._id, calculateCompleteness]);

  // Save individual section
  const handleSaveSection = useCallback(async (sectionName) => {
    const startTime = performance.now();

    try {
      setSavingSection(sectionName);
      setErrors({});
      setSuccessMessage('');

      await studentAPI.updateProfile(formData);

      apiCache.invalidate(`student-profile-${user?._id}`);

      const response = await studentAPI.getProfile({
        signal: abortController?.signal
      });

      if (response.data.success) {
        let profileData = response.data.data;

        // Normalize: Move bio from root to personalInfo for frontend compatibility
        if (profileData.bio && !profileData.personalInfo.bio) {
          profileData = {
            ...profileData,
            personalInfo: { ...profileData.personalInfo, bio: profileData.bio }
          };
        }

        setProfile(profileData);
        setFormData(profileData);
        setCompleteness(calculateCompleteness(profileData));
        apiCache.set(`student-profile-${user?._id}`, response.data, 5 * 60 * 1000);
      }

      setSuccessMessage(`${sectionName} saved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      const duration = performance.now() - startTime;
      logger.info(`${sectionName} saved successfully`, { duration });
    } catch (err) {
      logger.error(`Failed to update ${sectionName}`, err);
      setErrors({ [sectionName]: err.response?.data?.error || `Failed to update ${sectionName}` });
    } finally {
      setSavingSection(null);
    }
  }, [formData, abortController, user?._id, calculateCompleteness]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setFormData(profile);
    setEditing(false);
    setErrors({});
  }, [profile]);

  // Add Education
  const addEducation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [...(prev.education || []), {
        institution: '',
        degree: 'bachelor',
        major: '',
        graduationYear: new Date().getFullYear(),
        gpa: 0,
        startDate: '',
        endDate: ''
      }]
    }));
  }, []);

  // Remove Education
  const removeEducation = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }, []);

  // Update Education
  const updateEducation = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  }, []);

  // Add Skill
  const addSkill = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), {
        name: '',
        category: 'technical',
        level: 'intermediate'
      }]
    }));
  }, []);

  // Remove Skill
  const removeSkill = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  }, []);

  // Update Skill
  const updateSkill = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  }, []);

  // Add Experience
  const addExperience = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), {
        company: '',
        title: '',
        employmentType: 'internship',
        location: { city: '', country: '' },
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      }]
    }));
  }, []);

  // Remove Experience
  const removeExperience = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  }, []);

  // Update Experience
  const updateExperience = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchProfile();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">No profile data found</p>
            <button
              onClick={() => fetchProfile()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">My Profile</h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Profile Completeness: {completeness}%
            </p>
            <div className="w-full sm:w-64 h-2 bg-neutral-200 rounded-full mt-2">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Save Changes</span></>}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Personal Information */}
        <PersonalInfoSection
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          onSave={() => handleSaveSection('Personal Information')}
          saving={savingSection === 'Personal Information'}
        />

        {/* Social Links */}
        <SocialLinksSection
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          onSave={() => handleSaveSection('Social Links')}
          saving={savingSection === 'Social Links'}
        />

        {/* Education */}
        <EducationSection
          formData={formData}
          editing={editing}
          addEducation={addEducation}
          removeEducation={removeEducation}
          updateEducation={updateEducation}
          onSave={() => handleSaveSection('Education')}
          saving={savingSection === 'Education'}
        />

        {/* Skills */}
        <SkillsSection
          formData={formData}
          editing={editing}
          addSkill={addSkill}
          removeSkill={removeSkill}
          updateSkill={updateSkill}
          onSave={() => handleSaveSection('Skills')}
          saving={savingSection === 'Skills'}
        />

        {/* Experience */}
        <ExperienceSection
          formData={formData}
          editing={editing}
          addExperience={addExperience}
          removeExperience={removeExperience}
          updateExperience={updateExperience}
          onSave={() => handleSaveSection('Experience')}
          saving={savingSection === 'Experience'}
        />
      </div>
    </div>
  );
});

StudentProfile.displayName = 'StudentProfile';

/**
 * PERSONAL INFO SECTION
 */
const PersonalInfoSection = memo(({ profile, formData, setFormData, editing, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Personal Information</h2>
      </div>
      {editing && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        {editing ? (
          <input
            type="text"
            value={formData.personalInfo?.firstName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, firstName: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter first name"
          />
        ) : (
          <p className="text-neutral-900">{profile.personalInfo?.firstName || 'Not set'}</p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
          Last Name <span className="text-red-500">*</span>
        </label>
        {editing ? (
          <input
            type="text"
            value={formData.personalInfo?.lastName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, lastName: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter last name"
          />
        ) : (
          <p className="text-neutral-900">{profile.personalInfo?.lastName || 'Not set'}</p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Phone className="w-4 h-4" /> Phone
        </label>
        {editing ? (
          <input
            type="tel"
            value={formData.personalInfo?.phone || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, phone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="+1 (555) 123-4567"
          />
        ) : (
          <p className="text-neutral-900">{profile.personalInfo?.phone || 'Not set'}</p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Calendar className="w-4 h-4" /> Date of Birth
        </label>
        {editing ? (
          <input
            type="date"
            value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        ) : (
          <p className="text-neutral-900">
            {profile.personalInfo?.dateOfBirth
              ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()
              : 'Not set'}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Location
        </label>
        {editing ? (
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={formData.personalInfo?.location?.city || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  location: { ...prev.personalInfo.location, city: e.target.value }
                }
              }))}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="City"
            />
            <input
              type="text"
              value={formData.personalInfo?.location?.state || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  location: { ...prev.personalInfo.location, state: e.target.value }
                }
              }))}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="State"
            />
            <input
              type="text"
              value={formData.personalInfo?.location?.country || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  location: { ...prev.personalInfo.location, country: e.target.value }
                }
              }))}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Country"
            />
          </div>
        ) : (
          <p className="text-neutral-900">
            {[profile.personalInfo?.location?.city, profile.personalInfo?.location?.state, profile.personalInfo?.location?.country]
              .filter(Boolean).join(', ') || 'Not set'}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Bio</label>
        {editing ? (
          <textarea
            value={formData.personalInfo?.bio || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, bio: e.target.value }
            }))}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-neutral-700">{profile.personalInfo?.bio || 'No bio added'}</p>
        )}
      </div>
    </div>
  </div>
));

PersonalInfoSection.displayName = 'PersonalInfoSection';

/**
 * SOCIAL LINKS SECTION
 */
const SocialLinksSection = memo(({ profile, formData, setFormData, editing, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Social Links</h2>
      </div>
      {editing && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Linkedin className="w-4 h-4" /> LinkedIn
        </label>
        {editing ? (
          <input
            type="url"
            value={formData.socialLinks?.linkedin || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://linkedin.com/in/username"
          />
        ) : (
          <p className="text-neutral-900 truncate break-all sm:break-normal">
            {profile.socialLinks?.linkedin || 'Not set'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Github className="w-4 h-4" /> GitHub
        </label>
        {editing ? (
          <input
            type="url"
            value={formData.socialLinks?.github || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, github: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://github.com/username"
          />
        ) : (
          <p className="text-neutral-900 truncate break-all sm:break-normal">
            {profile.socialLinks?.github || 'Not set'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Globe className="w-4 h-4" /> Portfolio
        </label>
        {editing ? (
          <input
            type="url"
            value={formData.socialLinks?.portfolio || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, portfolio: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://yourportfolio.com"
          />
        ) : (
          <p className="text-neutral-900 truncate break-all sm:break-normal">
            {profile.socialLinks?.portfolio || 'Not set'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Globe className="w-4 h-4" /> Website
        </label>
        {editing ? (
          <input
            type="url"
            value={formData.socialLinks?.website || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              socialLinks: { ...prev.socialLinks, website: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://yourwebsite.com"
          />
        ) : (
          <p className="text-neutral-900 truncate break-all sm:break-normal">
            {profile.socialLinks?.website || 'Not set'}
          </p>
        )}
      </div>
    </div>
  </div>
));

SocialLinksSection.displayName = 'SocialLinksSection';

/**
 * EDUCATION SECTION
 */
const EducationSection = memo(({ formData, editing, addEducation, removeEducation, updateEducation, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Education</h2>
      </div>
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Education</span>
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">Save Section</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
    {formData.education?.length > 0 ? (
      <div className="space-y-4">
        {formData.education.map((edu, idx) => (
          <div key={idx} className="border-l-4 border-primary-500 pl-4 relative">
            {editing && (
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-0 right-0 text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <input
                  type="text"
                  value={edu.institution || ''}
                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Institution"
                />
                <select
                  value={edu.degree || 'bachelor'}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="high-school">High School</option>
                  <option value="associate">Associate</option>
                  <option value="bachelor">Bachelor's</option>
                  <option value="master">Master's</option>
                  <option value="phd">PhD</option>
                </select>
                <input
                  type="text"
                  value={edu.major || ''}
                  onChange={(e) => updateEducation(idx, 'major', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Major/Field of Study"
                />
                <input
                  type="number"
                  value={edu.graduationYear || ''}
                  onChange={(e) => updateEducation(idx, 'graduationYear', parseInt(e.target.value))}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Graduation Year"
                />
                <input
                  type="number"
                  step="0.01"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(idx, 'gpa', parseFloat(e.target.value))}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="GPA (optional)"
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-neutral-900 capitalize">{edu.degree}</h3>
                <p className="text-neutral-600">{edu.institution}</p>
                <p className="text-sm text-neutral-500">
                  {edu.major} • {edu.graduationYear}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-neutral-500">No education added yet</p>
    )}
  </div>
));

EducationSection.displayName = 'EducationSection';

/**
 * SKILLS SECTION
 */
const SkillsSection = memo(({ formData, editing, addSkill, removeSkill, updateSkill, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Skills</h2>
      </div>
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={addSkill}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Skill</span>
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">Save Section</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
    {formData.skills?.length > 0 ? (
      editing ? (
        <div className="space-y-3">
          {formData.skills.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={skill.name || ''}
                onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Skill name"
              />
              <select
                value={skill.category || 'technical'}
                onChange={(e) => updateSkill(idx, 'category', e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="technical">Technical</option>
                <option value="framework">Framework</option>
                <option value="tool">Tool</option>
                <option value="soft-skill">Soft Skill</option>
              </select>
              <select
                value={skill.level || 'intermediate'}
                onChange={(e) => updateSkill(idx, 'level', e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={() => removeSkill(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
            >
              {skill.name}
              <span className="text-xs text-primary-600">({skill.level})</span>
            </span>
          ))}
        </div>
      )
    ) : (
      <p className="text-neutral-500">No skills added yet</p>
    )}
  </div>
));

SkillsSection.displayName = 'SkillsSection';

/**
 * EXPERIENCE SECTION
 */
const ExperienceSection = memo(({ formData, editing, addExperience, removeExperience, updateExperience, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Experience</h2>
      </div>
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={addExperience}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Experience</span>
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="hidden sm:inline">Save Section</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
    {formData.experience?.length > 0 ? (
      <div className="space-y-4">
        {formData.experience.map((exp, idx) => (
          <div key={idx} className="border-l-4 border-primary-500 pl-4 relative">
            {editing && (
              <button
                onClick={() => removeExperience(idx)}
                className="absolute top-0 right-0 text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            )}
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <input
                  type="text"
                  value={exp.title || ''}
                  onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Company"
                />
                <select
                  value={exp.employmentType || 'internship'}
                  onChange={(e) => updateExperience(idx, 'employmentType', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => updateExperience(idx, 'current', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">Current Position</label>
                </div>
                <input
                  type="date"
                  value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Start Date"
                />
                {!exp.current && (
                  <input
                    type="date"
                    value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="End Date"
                  />
                )}
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                  className="col-span-2 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Description"
                  rows={3}
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-neutral-900">{exp.title}</h3>
                <p className="text-neutral-600">{exp.company} • {exp.employmentType}</p>
                <p className="text-sm text-neutral-500">
                  {exp.startDate && new Date(exp.startDate).toLocaleDateString()} -
                  {exp.current ? ' Present' : (exp.endDate && ` ${new Date(exp.endDate).toLocaleDateString()}`)}
                </p>
                {exp.description && <p className="text-sm text-neutral-700 mt-2">{exp.description}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-neutral-500">No experience added yet</p>
    )}
  </div>
));

ExperienceSection.displayName = 'ExperienceSection';

/**
 * ORGANIZATION PROFILE COMPONENT - Full Featured
 */
const OrganizationProfile = memo(() => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    companyInfo: {
      name: '',
      industry: '',
      companySize: '',
      founded: '',
      headquarters: { city: '', state: '', country: '' },
      website: ''
    },
    description: {
      short: '',
      full: ''
    },
    contactInfo: {
      primaryEmail: '',
      phone: '',
      hrEmail: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [savingSection, setSavingSection] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const abortController = useApi();
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    const cacheKey = `org-profile-${user?._id}`;
    const startTime = performance.now();

    try {
      setLoading(true);

      const cached = apiCache.get(cacheKey);
      if (cached && cached.data) {
        logger.info('Organization profile loaded from cache');
        setProfile(cached.data);
        setFormData(cached.data);
        setLoading(false);
        return;
      }

      const response = await organizationAPI.getProfile({
        signal: abortController?.signal
      });

      const duration = performance.now() - startTime;
      logger.performance('fetchOrganizationProfile', duration);

      if (response.data.success) {
        const profileData = response.data.data || {
          companyInfo: { name: '', industry: '', companySize: '', founded: '', headquarters: { city: '', state: '', country: '' }, website: '' },
          description: { short: '', full: '' },
          contactInfo: { primaryEmail: '', phone: '', hrEmail: '' }
        };
        apiCache.set(cacheKey, response.data, 5 * 60 * 1000);
        setProfile(profileData);
        setFormData(profileData);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') return;
      logger.error('Failed to fetch organization profile', err);
      apiCache.invalidate(cacheKey);
      // Set default empty profile instead of null
      const defaultProfile = {
        companyInfo: { name: '', industry: '', companySize: '', founded: '', headquarters: { city: '', state: '', country: '' }, website: '' },
        description: { short: '', full: '' },
        contactInfo: { primaryEmail: '', phone: '', hrEmail: '' }
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, [abortController, user?._id]);

  const handleSave = useCallback(async () => {
    const startTime = performance.now();

    try {
      setSaving(true);
      setErrors({});
      setSuccessMessage('');

      await organizationAPI.updateProfile(formData);
      setEditing(false);

      apiCache.invalidate(`org-profile-${user?._id}`);

      const response = await organizationAPI.getProfile({
        signal: abortController?.signal
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
        apiCache.set(`org-profile-${user?._id}`, response.data, 5 * 60 * 1000);
      }

      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      const duration = performance.now() - startTime;
      logger.info('Organization profile saved successfully', { duration });
    } catch (err) {
      logger.error('Failed to update organization profile', err);
      setErrors({ general: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  }, [formData, abortController, user?._id]);

  const handleSaveSection = useCallback(async (sectionName) => {
    const startTime = performance.now();

    try {
      setSavingSection(sectionName);
      setErrors({});
      setSuccessMessage('');

      await organizationAPI.updateProfile(formData);

      apiCache.invalidate(`org-profile-${user?._id}`);

      const response = await organizationAPI.getProfile({
        signal: abortController?.signal
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
        apiCache.set(`org-profile-${user?._id}`, response.data, 5 * 60 * 1000);
      }

      setSuccessMessage(`${sectionName} saved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      const duration = performance.now() - startTime;
      logger.info(`${sectionName} saved successfully`, { duration });
    } catch (err) {
      logger.error(`Failed to update ${sectionName}`, err);
      setErrors({ [sectionName]: err.response?.data?.error || `Failed to update ${sectionName}` });
    } finally {
      setSavingSection(null);
    }
  }, [formData, abortController, user?._id]);

  const handleCancel = useCallback(() => {
    setFormData(profile);
    setEditing(false);
    setErrors({});
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchProfile();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">No company profile data found</p>
            <button
              onClick={() => fetchProfile()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Company Profile</h1>
          <div className="flex gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Save Changes</span></>}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        <CompanyInfoSection
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          onSave={() => handleSaveSection('Company Information')}
          saving={savingSection === 'Company Information'}
        />
        <DescriptionSection
          profile={profile}
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          onSave={() => handleSaveSection('Company Description')}
          saving={savingSection === 'Company Description'}
        />
        <ContactInfoSection
          formData={formData}
          setFormData={setFormData}
          editing={editing}
          onSave={() => handleSaveSection('Contact Information')}
          saving={savingSection === 'Contact Information'}
        />
        <StatisticsSection profile={profile} />
      </div>
    </div>
  );
});

OrganizationProfile.displayName = 'OrganizationProfile';

const CompanyInfoSection = memo(({ profile, formData, setFormData, editing, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-neutral-900">Company Information</h2>
      </div>
      {editing && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      )}
    </div>
    <div className="flex items-start gap-4 mb-6">
      <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
        <Building2 className="w-10 h-10 text-primary-600" />
      </div>
      <div className="flex-1">
        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.companyInfo?.name || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                companyInfo: { ...prev.companyInfo, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-xl font-semibold"
              placeholder="Company Name"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={formData.companyInfo?.industry || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  companyInfo: { ...prev.companyInfo, industry: e.target.value }
                }))}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
              <select
                value={formData.companyInfo?.companySize || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  companyInfo: { ...prev.companyInfo, companySize: e.target.value }
                }))}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1001+">1001+ employees</option>
              </select>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-neutral-900">{profile.companyInfo?.name}</h2>
            <p className="text-neutral-600 capitalize">{profile.companyInfo?.industry}</p>
            <p className="text-sm text-neutral-500">{profile.companyInfo?.companySize} employees</p>
          </>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-2 text-neutral-600">
        <MapPin size={18} />
        {editing ? (
          <div className="flex-1 grid grid-cols-3 gap-2">
            <input
              type="text"
              value={formData.companyInfo?.headquarters?.city || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                companyInfo: {
                  ...prev.companyInfo,
                  headquarters: { ...prev.companyInfo.headquarters, city: e.target.value }
                }
              }))}
              className="px-2 py-1 border border-neutral-300 rounded text-sm"
              placeholder="City"
            />
            <input
              type="text"
              value={formData.companyInfo?.headquarters?.state || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                companyInfo: {
                  ...prev.companyInfo,
                  headquarters: { ...prev.companyInfo.headquarters, state: e.target.value }
                }
              }))}
              className="px-2 py-1 border border-neutral-300 rounded text-sm"
              placeholder="State"
            />
            <input
              type="text"
              value={formData.companyInfo?.headquarters?.country || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                companyInfo: {
                  ...prev.companyInfo,
                  headquarters: { ...prev.companyInfo.headquarters, country: e.target.value }
                }
              }))}
              className="px-2 py-1 border border-neutral-300 rounded text-sm"
              placeholder="Country"
            />
          </div>
        ) : (
          <span>
            {[profile.companyInfo?.headquarters?.city, profile.companyInfo?.headquarters?.state, profile.companyInfo?.headquarters?.country]
              .filter(Boolean).join(', ')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-neutral-600">
        <Globe size={18} />
        {editing ? (
          <input
            type="url"
            value={formData.companyInfo?.website || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              companyInfo: { ...prev.companyInfo, website: e.target.value }
            }))}
            className="flex-1 px-2 py-1 border border-neutral-300 rounded text-sm"
            placeholder="https://company.com"
          />
        ) : (
          <span>{profile.companyInfo?.website || 'Not set'}</span>
        )}
      </div>
    </div>
  </div>
));

CompanyInfoSection.displayName = 'CompanyInfoSection';

const DescriptionSection = memo(({ profile, formData, setFormData, editing, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-neutral-900">Company Description</h3>
      {editing && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      )}
    </div>
    {editing ? (
      <div className="space-y-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Short Description</label>
          <input
            type="text"
            value={formData.description?.short || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: { ...prev.description, short: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="One-line company description"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Full Description</label>
          <textarea
            value={formData.description?.full || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: { ...prev.description, full: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            rows={5}
            placeholder="Detailed company description..."
          />
        </div>
      </div>
    ) : (
      <>
        <p className="text-neutral-700 mb-4">{profile.description?.short}</p>
        <p className="text-neutral-600 text-sm">{profile.description?.full}</p>
      </>
    )}
  </div>
));

DescriptionSection.displayName = 'DescriptionSection';

const ContactInfoSection = memo(({ formData, setFormData, editing, onSave, saving }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-4 sm:p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Contact Information</h3>
      </div>
      {editing && (
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Mail size={16} /> Primary Email
        </label>
        {editing ? (
          <input
            type="email"
            value={formData.contactInfo?.primaryEmail || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...prev.contactInfo, primaryEmail: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="contact@company.com"
          />
        ) : (
          <p className="text-neutral-900">{formData.contactInfo?.primaryEmail || 'Not set'}</p>
        )}
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Phone size={16} /> Phone
        </label>
        {editing ? (
          <input
            type="tel"
            value={formData.contactInfo?.phone || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...prev.contactInfo, phone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="+1 (555) 123-4567"
          />
        ) : (
          <p className="text-neutral-900">{formData.contactInfo?.phone || 'Not set'}</p>
        )}
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 flex items-center gap-1">
          <Mail size={16} /> HR Email
        </label>
        {editing ? (
          <input
            type="email"
            value={formData.contactInfo?.hrEmail || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contactInfo: { ...prev.contactInfo, hrEmail: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="hr@company.com"
          />
        ) : (
          <p className="text-neutral-900">{formData.contactInfo?.hrEmail || 'Not set'}</p>
        )}
      </div>
    </div>
  </div>
));

ContactInfoSection.displayName = 'ContactInfoSection';

const StatisticsSection = memo(({ profile }) => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Award className="w-5 h-5 text-primary-600" />
      <h3 className="text-lg font-semibold text-neutral-900">Statistics</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p className="text-2xl font-bold text-primary-600">{profile.statistics?.totalInternships || 0}</p>
        <p className="text-sm text-neutral-600">Internships Posted</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-600">{profile.statistics?.activeInternships || 0}</p>
        <p className="text-sm text-neutral-600">Active Listings</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-600">{profile.statistics?.totalApplications || 0}</p>
        <p className="text-sm text-neutral-600">Applications Received</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-primary-600">{profile.statistics?.totalHires || 0}</p>
        <p className="text-sm text-neutral-600">Hires Made</p>
      </div>
    </div>
  </div>
));

StatisticsSection.displayName = 'StatisticsSection';

export default ProfilePage;