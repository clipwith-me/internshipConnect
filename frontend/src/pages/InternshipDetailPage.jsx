// frontend/src/pages/InternshipDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, MapPin, Briefcase, DollarSign, Clock, Building2,
  Calendar, Users, TrendingUp, CheckCircle2, AlertCircle, Upload, X, FileText
} from 'lucide-react';

const InternshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    try {
      setLoading(true);
      const response = await internshipAPI.getById(id);
      if (response.data.success) {
        setInternship(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load internship');
    } finally {
      setLoading(false);
    }
  };

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Allowed file types for cover letter
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');

    if (!file) {
      setCoverLetterFile(null);
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT file.');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setUploadError('File too large. Maximum size is 2MB.');
      e.target.value = '';
      return;
    }

    setCoverLetterFile(file);
  };

  const removeFile = () => {
    setCoverLetterFile(null);
    setUploadError('');
    // Reset file input
    const fileInput = document.getElementById('coverLetterFileInput');
    if (fileInput) fileInput.value = '';
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('internshipId', id);

      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }

      if (coverLetterFile) {
        formData.append('coverLetterFile', coverLetterFile);
      }

      await applicationAPI.submit(formData);
      alert('Application submitted successfully!');
      setShowApplicationModal(false);
      setCoverLetter('');
      setCoverLetterFile(null);
      navigate('/dashboard/applications');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  // Check if form is valid (at least cover letter text or file)
  const isFormValid = coverLetter.trim().length > 0 || coverLetterFile !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard/internships')}
            className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to listings
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Internship not found'}
          </div>
        </div>
      </div>
    );
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/internships')}
          className="flex items-center text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to listings
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-primary-50 to-primary-100/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold text-neutral-900 mb-3">
                  {internship.title}
                </h1>
                <div className="flex items-center text-neutral-700 mb-2">
                  <Building2 className="w-5 h-5 mr-2" />
                  <span className="text-lg font-medium">
                    {internship.organization?.companyInfo?.companyName || 'Company Name'}
                  </span>
                </div>
              </div>
              {internship.featured?.isFeatured && (
                <span className="px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <InfoBox
                icon={<MapPin className="w-5 h-5" />}
                label="Location"
                value={internship.location?.type === 'remote' ? 'Remote' : internship.location?.city || 'N/A'}
              />
              <InfoBox
                icon={<Briefcase className="w-5 h-5" />}
                label="Type"
                value={internship.location?.type?.charAt(0).toUpperCase() + internship.location?.type?.slice(1) || 'N/A'}
              />
              <InfoBox
                icon={<DollarSign className="w-5 h-5" />}
                label="Compensation"
                value={internship.compensationDisplay || 'Not specified'}
              />
              <InfoBox
                icon={<Users className="w-5 h-5" />}
                label="Applicants"
                value={internship.statistics?.applications || 0}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary-600" />
                About This Internship
              </h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>
            </section>

            {/* Requirements */}
            {internship.requirements?.description && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-primary-600" />
                  Requirements
                </h2>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                  {internship.requirements.description}
                </p>
              </section>
            )}

            {/* Timeline */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {internship.timeline?.startDate && (
                  <TimelineBox
                    label="Start Date"
                    date={new Date(internship.timeline.startDate).toLocaleDateString()}
                  />
                )}
                {internship.timeline?.endDate && (
                  <TimelineBox
                    label="End Date"
                    date={new Date(internship.timeline.endDate).toLocaleDateString()}
                  />
                )}
                {internship.timeline?.applicationDeadline && (
                  <TimelineBox
                    label="Application Deadline"
                    date={new Date(internship.timeline.applicationDeadline).toLocaleDateString()}
                    urgent
                  />
                )}
              </div>
            </section>

            {/* Benefits */}
            {internship.compensation?.benefits && internship.compensation.benefits.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                  Benefits
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {internship.compensation.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start text-neutral-700">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Apply Button */}
            {isStudent && (
              <div className="pt-6 border-t border-neutral-200">
                <button
                  onClick={() => setShowApplicationModal(true)}
                  disabled={internship.status !== 'active'}
                  className="w-full h-14 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {internship.status !== 'active' ? 'Not Available' : 'Apply Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8 animate-scaleIn max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Submit Application</h3>
              <p className="text-neutral-600 mb-6">
                Applying for: <span className="font-medium">{internship.title}</span>
              </p>

              {/* Cover Letter Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Cover Letter (Optional - max 3000 characters)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder="Explain why you're interested in this internship and why you'd be a great fit..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-neutral-500 text-sm mt-1">{coverLetter.length} / 3000 characters</p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Or Upload Cover Letter File (PDF, DOC, DOCX, TXT - max 2MB)
                </label>

                {!coverLetterFile ? (
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      id="coverLetterFileInput"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverLetterFileInput"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                      <span className="text-sm text-neutral-600">Click to upload or drag and drop</span>
                      <span className="text-xs text-neutral-400 mt-1">PDF, DOC, DOCX, or TXT up to 2MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{coverLetterFile.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(coverLetterFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-primary-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-500 hover:text-red-500" />
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-red-600 text-sm mt-2">{uploadError}</p>
                )}
              </div>

              <p className="text-sm text-neutral-500 mb-6">
                You can provide a text cover letter, upload a file, or both.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setCoverLetter('');
                    setCoverLetterFile(null);
                    setUploadError('');
                  }}
                  className="flex-1 h-12 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !isFormValid}
                  className="flex-1 h-12 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoBox = ({ icon, label, value }) => (
  <div className="bg-white/50 rounded-lg p-4 border border-neutral-200/50">
    <div className="flex items-center text-primary-600 mb-2">
      {icon}
    </div>
    <p className="text-xs text-neutral-600 mb-1">{label}</p>
    <p className="font-semibold text-neutral-900">{value}</p>
  </div>
);

const TimelineBox = ({ label, date, urgent }) => (
  <div className={`rounded-lg p-4 border ${urgent ? 'bg-red-50 border-red-200' : 'bg-neutral-50 border-neutral-200'}`}>
    <p className={`text-sm font-medium ${urgent ? 'text-red-700' : 'text-neutral-600'} mb-2`}>{label}</p>
    <p className={`text-lg font-semibold ${urgent ? 'text-red-900' : 'text-neutral-900'}`}>{date}</p>
  </div>
);

export default InternshipDetailPage;
