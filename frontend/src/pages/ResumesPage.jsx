// frontend/src/pages/ResumesPage.jsx
import { useState, useEffect } from 'react';
import { resumeAPI, studentAPI } from '../services/api';
import { FileText, Download, Trash2, Plus, Calendar, Eye, AlertCircle } from 'lucide-react';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';

const ResumesPage = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [usageData, setUsageData] = useState({ current: 0, limit: 3 });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getAll();
      if (response.data.success) {
        setResumes(response.data.data);

        // Calculate usage for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const resumesThisMonth = response.data.data.filter(r =>
          new Date(r.createdAt) >= startOfMonth
        ).length;

        // Get subscription plan limits
        const plan = user?.subscription?.plan || 'free';
        const limits = {
          free: 3,
          premium: 10,
          pro: -1 // unlimited
        };

        setUsageData({
          current: resumesThisMonth,
          limit: limits[plan] === -1 ? 'unlimited' : limits[plan]
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (customization) => {
    try {
      setGenerating(true);

      // ✅ FIX: Validate profile completeness before generation
      const profileResponse = await studentAPI.getProfile();
      const profile = profileResponse.data.data;

      // Check education
      if (!profile.education || profile.education.length === 0) {
        alert('📚 Please add at least one education entry to your profile before generating a resume.\n\nGo to Profile → Education section to add your educational background.');
        setGenerating(false);
        setShowGenerateModal(false);
        return;
      }

      // Check skills
      if (!profile.skills || profile.skills.length < 3) {
        alert('💼 Please add at least 3 skills to your profile before generating a resume.\n\nGo to Profile → Skills section to add your skills.');
        setGenerating(false);
        setShowGenerateModal(false);
        return;
      }

      // Check basic personal info
      if (!profile.personalInfo?.firstName || !profile.personalInfo?.lastName) {
        alert('👤 Please complete your name in your profile before generating a resume.\n\nGo to Profile → Personal Information section.');
        setGenerating(false);
        setShowGenerateModal(false);
        return;
      }

      // Generate resume
      const response = await resumeAPI.generate({ customization });

      if (response.data.success) {
        setShowGenerateModal(false);
        fetchResumes();

        // Update usage data from response
        const usage = response.data.usage;
        if (usage) {
          setUsageData({
            current: usage.current,
            limit: usage.limit === 'unlimited' ? 'unlimited' : usage.limit
          });
        }
      }
    } catch (err) {
      // Better error handling with PricingModal
      const error = err.response?.data?.error || 'Failed to generate resume';

      if (error.includes('plan allows') || err.response?.data?.upgradeRequired) {
        // Subscription limit reached - show pricing modal
        setShowGenerateModal(false);
        setShowPricingModal(true);
      } else if (error.includes('AI') || error.includes('service')) {
        // AI service issue
        alert('🤖 AI service is temporarily unavailable.\n\nPlease try again in a few minutes. If the problem persists, contact support.');
      } else if (error.includes('profile')) {
        // Profile incomplete
        alert(`📋 ${error}\n\nPlease complete your profile before generating a resume.`);
      } else {
        // Generic error
        alert(`❌ ${error}\n\nPlease try again. If the problem persists, contact support.`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeAPI.delete(id);
      fetchResumes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete resume');
    }
  };

  const handleDownload = async (resume) => {
    try {
      // ✅ FIX: Use proper download endpoint for PDF files
      const fileUrl = resume.aiGenerated?.fileUrl;

      // Check if it's a real PDF file (not mock Cloudinary URL)
      if (fileUrl && !fileUrl.includes('cloudinary.com/internshipconnect')) {
        try {
          // Use API client for proper authenticated file download with token refresh
          const response = await resumeAPI.download(resume._id);

          if (response.data) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = resume.aiGenerated?.fileName || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            return;
          }
        } catch (downloadError) {
          console.log('PDF download failed, falling back to text summary:', downloadError);
          // Fall through to text fallback
        }
      }

      // Fallback: Create text file if PDF doesn't exist
      const content = `
${resume.aiGenerated?.customization?.targetRole || 'Resume'}
Generated: ${new Date(resume.createdAt).toLocaleDateString()}
Template: ${resume.aiGenerated?.customization?.template || 'professional'}

ATS Score: ${resume.aiGenerated?.analysis?.atsScore || 'N/A'}%
Readability Score: ${resume.aiGenerated?.analysis?.readabilityScore || 'N/A'}%

Keywords: ${resume.aiGenerated?.analysis?.keywords?.join(', ') || 'N/A'}

Strengths:
${resume.aiGenerated?.analysis?.strengths?.map(s => `• ${s}`).join('\n') || '• Resume generated successfully'}

Suggestions:
${resume.aiGenerated?.analysis?.suggestions?.map(s => `• ${s}`).join('\n') || '• Keep up the good work!'}
`.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resume.version || 1}-${new Date(resume.createdAt).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user is at or near limit
  const isAtLimit = usageData.limit !== 'unlimited' && usageData.current >= usageData.limit;
  const isNearLimit = usageData.limit !== 'unlimited' && usageData.current >= usageData.limit - 1;

  const handleGenerateClick = () => {
    // Block generation if at limit
    if (isAtLimit) {
      setShowPricingModal(true);
      return;
    }
    setShowGenerateModal(true);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">My Resumes</h1>
            <p className="text-neutral-600 mt-2">Generate and manage AI-powered resumes</p>
          </div>
          <button
            onClick={handleGenerateClick}
            disabled={isAtLimit}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              isAtLimit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <Plus size={20} />
            Generate New Resume
          </button>
        </div>

        {/* Usage Tracking Banner */}
        {usageData.limit !== 'unlimited' && (
          <div className={`rounded-lg border-2 p-4 mb-6 ${
            isAtLimit
              ? 'bg-red-50 border-red-300'
              : isNearLimit
              ? 'bg-amber-50 border-amber-300'
              : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    isAtLimit ? 'text-red-900' : isNearLimit ? 'text-amber-900' : 'text-blue-900'
                  }`}>
                    {isAtLimit
                      ? 'Resume Generation Limit Reached'
                      : `${usageData.current} of ${usageData.limit} Resumes Used This Month`
                    }
                  </p>
                  <p className={`text-sm mt-1 ${
                    isAtLimit ? 'text-red-700' : isNearLimit ? 'text-amber-700' : 'text-blue-700'
                  }`}>
                    {isAtLimit
                      ? `You've used all ${usageData.limit} free resumes for this month. Upgrade to Premium (10/month) or Pro (unlimited) to continue.`
                      : isNearLimit
                      ? `You're almost at your monthly limit. Consider upgrading for unlimited resumes.`
                      : `Free plan resets on the 1st of each month. Upgrade for more resumes anytime.`
                    }
                  </p>
                </div>
              </div>
              {(isAtLimit || isNearLimit) && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                    isAtLimit
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {resumes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-12 text-center">
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No resumes yet</h3>
            <p className="text-neutral-600 mb-6">Generate your first AI-powered resume to get started</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Generate Resume
            </button>
          </div>
        ) : (
          /* Resume Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onDownload={() => handleDownload(resume)}
                onDelete={() => handleDelete(resume._id)}
              />
            ))}
          </div>
        )}

        {/* Generate Modal */}
        {showGenerateModal && (
          <GenerateResumeModal
            onClose={() => setShowGenerateModal(false)}
            onGenerate={handleGenerate}
            generating={generating}
          />
        )}

        {/* Pricing Modal */}
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          currentUsage={usageData.current}
          limit={usageData.limit}
        />
      </div>
    </div>
  );
};

const ResumeCard = ({ resume, onDownload, onDelete }) => {
  const customization = resume.aiGenerated?.customization?.template || 'professional';
  const generatedAt = resume.aiGenerated?.generatedAt || resume.createdAt;
  const atsScore = resume.aiGenerated?.analysis?.atsScore;

  const customizationColors = {
    professional: 'bg-blue-100 text-blue-700',
    creative: 'bg-purple-100 text-purple-700',
    modern: 'bg-cyan-100 text-cyan-700',
    minimal: 'bg-neutral-100 text-neutral-700',
    classic: 'bg-amber-100 text-amber-700',
    technical: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${customizationColors[customization] || customizationColors.professional}`}>
          {customization.charAt(0).toUpperCase() + customization.slice(1)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Resume v{resume.version || 1}
      </h3>

      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
        <Calendar className="w-4 h-4" />
        Generated {new Date(generatedAt).toLocaleDateString()}
      </div>

      {atsScore && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600">ATS Score</span>
            <span className="font-medium text-neutral-900">{atsScore}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${atsScore}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onDownload}
          className="flex-1 h-10 px-4 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={onDelete}
          className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const GenerateResumeModal = ({ onClose, onGenerate, generating }) => {
  const [customization, setCustomization] = useState('professional');

  const styles = [
    {
      value: 'professional',
      label: 'Professional',
      description: 'Clean and formal design for corporate roles',
      icon: '💼',
    },
    {
      value: 'creative',
      label: 'Creative',
      description: 'Bold and unique for design and creative fields',
      icon: '🎨',
    },
    {
      value: 'modern',
      label: 'Modern',
      description: 'Contemporary layout for tech and startups',
      icon: '🚀',
    },
    {
      value: 'minimal',
      label: 'Minimal',
      description: 'Simple and elegant for any industry',
      icon: '✨',
    },
  ];

  return (
    <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-semibold text-neutral-900">Generate Resume</h2>
          <p className="text-neutral-600 mt-1">Choose a style for your AI-generated resume</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {styles.map((style) => (
              <button
                key={style.value}
                onClick={() => setCustomization(style.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  customization === style.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="text-3xl mb-2">{style.icon}</div>
                <h3 className="font-semibold text-neutral-900 mb-1">{style.label}</h3>
                <p className="text-sm text-neutral-600">{style.description}</p>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Your resume will be generated using information from your profile, including education, skills, and experience.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={generating}
            className="flex-1 h-12 px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(customization)}
            disabled={generating}
            className="flex-1 h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              'Generate Resume'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumesPage;
