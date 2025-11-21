// frontend/src/pages/ApplicationsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI, resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, Eye, X, User, FileText, Building2, Download, Mail, GraduationCap, Code } from 'lucide-react';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine if user is organization or student
  const isOrganization = user?.role === 'organization';

  useEffect(() => {
    if (isOrganization) {
      fetchOrganizationApplications();
    } else {
      fetchStudentApplications();
    }
  }, [isOrganization]);

  // Fetch applications for students (their own applications)
  const fetchStudentApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await applicationAPI.getMyApplications();
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for organizations (applications to their internships)
  // ✅ OPTIMIZED: Single API call instead of N+1 queries
  const fetchOrganizationApplications = async () => {
    try {
      setLoading(true);
      setError('');

      // Single optimized API call to get all organization applications
      const response = await applicationAPI.getOrganizationApplications({ limit: 100 });

      if (response.data.success) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await applicationAPI.withdraw(id);
      fetchStudentApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await applicationAPI.updateStatus(id, newStatus);
      fetchOrganizationApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-8">
          {isOrganization ? 'Received Applications' : 'My Applications'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-12 text-center">
            <Briefcase className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {isOrganization ? 'No applications received yet' : 'No applications yet'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {isOrganization
                ? 'Once students apply to your internships, they will appear here'
                : 'Start applying to internships that match your interests'}
            </p>
            <button
              onClick={() => navigate(isOrganization ? '/dashboard/my-internships' : '/dashboard/internships')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              {isOrganization ? 'View My Internships' : 'Browse Internships'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              isOrganization ? (
                <OrganizationApplicationCard
                  key={application._id}
                  application={application}
                  onUpdateStatus={handleUpdateStatus}
                />
              ) : (
                <StudentApplicationCard
                  key={application._id}
                  application={application}
                  onView={() => navigate(`/dashboard/internships/${application.internship?._id}`)}
                  onWithdraw={() => handleWithdraw(application._id)}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Card for students viewing their applications
const StudentApplicationCard = ({ application, onView, onWithdraw }) => {
  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-700',
      'under-review': 'bg-purple-100 text-purple-700',
      shortlisted: 'bg-cyan-100 text-cyan-700',
      interview: 'bg-amber-100 text-amber-700',
      offered: 'bg-green-100 text-green-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-neutral-100 text-neutral-600'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  const canWithdraw = ['submitted', 'under-review'].includes(application.status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {application.internship?.title || 'Internship Title'}
          </h3>
          <p className="text-neutral-600 text-sm">
            {application.internship?.organization?.companyInfo?.companyName || 'Company Name'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {application.status?.replace('-', ' ').charAt(0).toUpperCase() + application.status?.slice(1).replace('-', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          Applied {new Date(application.createdAt).toLocaleDateString()}
        </div>
      </div>

      {application.coverLetter && (
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">Cover Letter</p>
          <p className="text-sm text-neutral-600 line-clamp-3">{application.coverLetter}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onView}
          className="flex-1 h-10 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Internship
        </button>
        {canWithdraw && (
          <button
            onClick={onWithdraw}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
};

// Card for organizations viewing received applications
const OrganizationApplicationCard = ({ application, onUpdateStatus }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-700',
      'under-review': 'bg-purple-100 text-purple-700',
      shortlisted: 'bg-cyan-100 text-cyan-700',
      interview: 'bg-amber-100 text-amber-700',
      offered: 'bg-green-100 text-green-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-neutral-100 text-neutral-600'
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offered', label: 'Offered' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const studentName = application.student?.personalInfo?.firstName && application.student?.personalInfo?.lastName
    ? `${application.student.personalInfo.firstName} ${application.student.personalInfo.lastName}`
    : 'Student';

  const handleViewProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await resumeAPI.viewApplicant(application._id);
      if (response.data.success) {
        setProfileData(response.data.data);
        setShowProfile(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load applicant profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-neutral-900">
                {studentName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 text-sm">
              <Building2 className="w-4 h-4" />
              <span>Applied for: {application.internship?.title || 'Internship'}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {application.status?.replace('-', ' ').charAt(0).toUpperCase() + application.status?.slice(1).replace('-', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Applied {new Date(application.createdAt).toLocaleDateString()}
          </div>
        </div>

        {application.coverLetter && (
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Cover Letter
            </p>
            <p className="text-sm text-neutral-600 line-clamp-3">{application.coverLetter}</p>
          </div>
        )}

        {application.coverLetterFile?.fileName && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-primary-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Attached: {application.coverLetterFile.fileName}
            </p>
            {application.coverLetterFile.fileUrl && (
              <a
                href={application.coverLetterFile.fileUrl}
                download={application.coverLetterFile.fileName}
                className="flex items-center gap-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleViewProfile}
            disabled={loadingProfile}
            className="h-10 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {loadingProfile ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Eye className="w-4 h-4" />
            )}
            View Profile & Resume
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-neutral-700">Update Status:</label>
          <select
            value={application.status}
            onChange={(e) => onUpdateStatus(application._id, e.target.value)}
            className="flex-1 h-10 px-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicant Profile Modal */}
      {showProfile && profileData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-neutral-900">Applicant Profile</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <section>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Personal Information
                </h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-lg font-medium text-neutral-900">
                    {profileData.student.personalInfo?.firstName} {profileData.student.personalInfo?.lastName}
                  </p>
                  {profileData.student.email && (
                    <p className="text-neutral-600 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {profileData.student.email}
                    </p>
                  )}
                  {profileData.student.personalInfo?.phone && (
                    <p className="text-neutral-600 mt-1">
                      Phone: {profileData.student.personalInfo.phone}
                    </p>
                  )}
                </div>
              </section>

              {/* Education */}
              {profileData.student.education && profileData.student.education.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary-600" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {profileData.student.education.map((edu, index) => (
                      <div key={index} className="bg-neutral-50 rounded-lg p-4">
                        <p className="font-medium text-neutral-900">{edu.institution}</p>
                        <p className="text-neutral-600">{edu.degree} in {edu.fieldOfStudy}</p>
                        {edu.gpa && <p className="text-neutral-500 text-sm">GPA: {edu.gpa}</p>}
                        <p className="text-neutral-500 text-sm">
                          {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {profileData.student.skills && profileData.student.skills.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary-600" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.student.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Experience */}
              {profileData.student.experience && profileData.student.experience.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    Experience
                  </h3>
                  <div className="space-y-3">
                    {profileData.student.experience.map((exp, index) => (
                      <div key={index} className="bg-neutral-50 rounded-lg p-4">
                        <p className="font-medium text-neutral-900">{exp.title}</p>
                        <p className="text-neutral-600">{exp.company}</p>
                        <p className="text-neutral-500 text-sm">
                          {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                        </p>
                        {exp.description && (
                          <p className="text-neutral-600 text-sm mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resumes */}
              {profileData.resumes && profileData.resumes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Resumes
                  </h3>
                  <div className="space-y-2">
                    {profileData.resumes.map((resume, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-neutral-900">{resume.fileName || `Resume v${resume.version}`}</p>
                          <p className="text-neutral-500 text-sm">
                            Created: {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {resume.fileUrl && (
                          <a
                            href={resume.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Cover Letter from Application */}
              {(profileData.application.coverLetter || profileData.application.coverLetterFile) && (
                <section>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Cover Letter
                  </h3>
                  {profileData.application.coverLetter && (
                    <div className="bg-neutral-50 rounded-lg p-4 mb-3">
                      <p className="text-neutral-700 whitespace-pre-line">{profileData.application.coverLetter}</p>
                    </div>
                  )}
                  {profileData.application.coverLetterFile?.fileUrl && (
                    <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div>
                        <p className="font-medium text-primary-900">
                          {profileData.application.coverLetterFile.fileName || 'Cover Letter File'}
                        </p>
                        <p className="text-primary-600 text-sm">
                          {profileData.application.coverLetterFile.mimeType} • {Math.round((profileData.application.coverLetterFile.fileSize || 0) / 1024)} KB
                        </p>
                      </div>
                      <a
                        href={profileData.application.coverLetterFile.fileUrl}
                        download={profileData.application.coverLetterFile.fileName || 'cover-letter'}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200">
              <button
                onClick={() => setShowProfile(false)}
                className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationsPage;