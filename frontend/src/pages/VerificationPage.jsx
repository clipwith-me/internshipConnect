import { useState, useEffect } from 'react';
import { verificationAPI } from '../services/api';
import { ShieldCheck, ShieldAlert, Upload, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

const statusDisplay = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected' },
};

const VerificationPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    verificationAPI.getStatus()
      .then(res => setStatus(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentUrl) return setError('Please provide a document URL');
    setSubmitting(true);
    setError('');
    try {
      const res = await verificationAPI.submit({ documentUrl, documentName });
      setStatus(res.data.data);
      setSuccess("Verification request submitted! We'll review it within 2 business days.");
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const currentStatus = status?.status;
  const display = currentStatus ? statusDisplay[currentStatus] : null;
  const StatusIcon = display?.icon;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Company Verification</h1>
        </div>

        {/* Benefits banner */}
        <div className="bg-gradient-to-br from-[#0D1426] to-[#1a2540] rounded-2xl p-6 text-white mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Why get verified?
          </h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">✓ <span>Blue verified badge on all your listings</span></li>
            <li className="flex items-center gap-2">✓ <span>Significantly more student applications</span></li>
            <li className="flex items-center gap-2">✓ <span>Higher trust score in search results</span></li>
            <li className="flex items-center gap-2">✓ <span>Priority placement on InternshipConnect</span></li>
          </ul>
        </div>

        {/* Current status */}
        {currentStatus && display && (
          <div className={`rounded-xl border p-5 mb-6 ${display.bg} ${display.border}`}>
            <div className={`flex items-center gap-3 font-semibold ${display.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span>Status: {display.label}</span>
            </div>
            {status.adminNote && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Admin note:</strong> {status.adminNote}
              </p>
            )}
            {status.submittedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(status.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Show form only if not yet approved and not pending */}
        {currentStatus !== 'approved' && currentStatus !== 'pending' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Submit Verification Document</h3>
            <p className="text-sm text-gray-500 mb-5">
              Upload your CAC registration certificate, business license, or other official business document.
              Upload to Cloudinary or your preferred file host and paste the public URL below.
            </p>

            {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document URL *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={e => setDocumentUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be a publicly accessible URL to your document</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name (optional)</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  placeholder="e.g. CAC Certificate RC1234567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <Upload className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}

        {currentStatus === 'pending' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <Clock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Your verification is under review. We typically respond within 2 business days.</p>
          </div>
        )}

        {currentStatus === 'approved' && (
          <div className="bg-white rounded-xl border border-green-100 p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 mb-1">Your company is verified!</p>
            <p className="text-gray-500 text-sm">The verified badge now appears on all your internship listings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
