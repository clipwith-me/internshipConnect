// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, organizationAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import { Building2, Mail, MapPin, Save, Edit2 } from 'lucide-react';
import {
  SkeletonProfileHeader,
  SkeletonProfileInfo,
  SkeletonList,
  SkeletonSkills,
  SkeletonOrganizationHeader,
  SkeletonStats
} from '../components/SkeletonLoader';

const ProfilePage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  return isStudent ? <StudentProfile /> : <OrganizationProfile />;
};

const StudentProfile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    personalInfo: { firstName: '', lastName: '', phone: '', dateOfBirth: '', location: { city: '', country: '' } },
    education: [],
    skills: [],
    experience: []
  });
  const abortController = useApi();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getProfile({
          signal: abortController?.signal
        });

        if (!isMounted) return; // Component unmounted

        if (response.data.success) {
          setProfile(response.data.data);
          setFormData(response.data.data);
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          console.error('Failed to fetch profile:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // ✅ FIX: Empty dependency array - fetch only once

  const handleSave = async () => {
    try {
      setLoading(true);
      await studentAPI.updateProfile(formData);
      setEditing(false);
      // Refetch profile after save
      const response = await studentAPI.getProfile({
        signal: abortController?.signal
      });
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ PERFORMANCE: Show skeleton screens while loading instead of blank spinner
  if (loading || !profile) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonProfileHeader />
          <SkeletonProfileInfo />
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonList items={2} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonSkills />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonList items={2} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">My Profile</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing ? <><Save size={20} /> Save Changes</> : <><Edit2 size={20} /> Edit Profile</>}
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.personalInfo?.firstName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-neutral-900">{profile.personalInfo?.firstName || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.personalInfo?.lastName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-neutral-900">{profile.personalInfo?.lastName || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.personalInfo?.phone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-neutral-900">{profile.personalInfo?.phone || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
              <p className="text-neutral-900">
                {profile.personalInfo?.location?.city}, {profile.personalInfo?.location?.country || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Education</h2>
          {profile.education?.length > 0 ? (
            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-neutral-900">{edu.degree}</h3>
                  <p className="text-neutral-600">{edu.institution}</p>
                  <p className="text-sm text-neutral-500">Graduation: {new Date(edu.graduationDate).getFullYear()}</p>
                  {edu.gpa && <p className="text-sm text-neutral-500">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No education added yet</p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Skills</h2>
          {profile.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No skills added yet</p>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Experience</h2>
          {profile.experience?.length > 0 ? (
            <div className="space-y-4">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-4">
                  <h3 className="font-semibold text-neutral-900">{exp.title}</h3>
                  <p className="text-neutral-600">{exp.company}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No experience added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const OrganizationProfile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const abortController = useApi();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await organizationAPI.getProfile({
          signal: abortController?.signal
        });

        if (!isMounted) return; // Component unmounted

        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          console.error('Failed to fetch profile:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // ✅ FIX: Empty dependency array - fetch only once

  // ✅ PERFORMANCE: Show skeleton screens while loading instead of blank spinner
  if (loading || !profile) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonProfileHeader />
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
            <SkeletonOrganizationHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonStats />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">Company Profile</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Edit2 size={20} /> Edit Profile
          </button>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-neutral-900">{profile.companyInfo?.name}</h2>
              <p className="text-neutral-600">{profile.companyInfo?.industry}</p>
              <p className="text-sm text-neutral-500">{profile.companyInfo?.companySize} employees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin size={18} />
              <span>{profile.companyInfo?.headquarters?.city}, {profile.companyInfo?.headquarters?.country}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Mail size={18} />
              <span>{profile.contactInfo?.primaryEmail}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">About</h3>
          <p className="text-neutral-700 mb-4">{profile.description?.short}</p>
          <p className="text-neutral-600 text-sm">{profile.description?.full}</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Statistics</h3>
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
      </div>
    </div>
  );
};

export default ProfilePage;
