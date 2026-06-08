import { useState, useEffect } from 'react';
import { referralAPI } from '../services/api';
import { Gift, Copy, Check, Users, Share2, ExternalLink } from 'lucide-react';

const ReferralPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    referralAPI.getMyCode()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!data?.referralUrl) return;
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!data?.referralUrl) return;
    const text = encodeURIComponent(`Join me on InternshipConnect — Africa's career platform for students!\n${data.referralUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Refer a Friend</h1>
        </div>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-xl font-bold mb-2">Earn rewards by inviting friends</h2>
          <p className="text-amber-100 text-sm leading-relaxed">
            Share your referral link with fellow students. When they sign up and complete their profile, you earn priority access to new features and featured placement in employer searches.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="text-3xl font-bold text-amber-500">{data?.totalReferrals || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Friends Invited</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
            <div className="text-3xl font-bold text-green-500">{data?.completedReferrals || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Profiles Completed</div>
          </div>
        </div>

        {/* Referral link */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-1">Your Referral Code</h3>
          <p className="text-xs text-gray-500 mb-3">Share this link — anyone who signs up through it is credited to you.</p>

          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-3">
            <span className="flex-1 text-sm text-gray-700 font-mono break-all">{data?.referralUrl || '—'}</span>
            <span className="flex-shrink-0 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {data?.code}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 border border-green-500 text-green-600 hover:bg-green-50 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            How it works
          </h3>
          <ol className="space-y-3">
            {[
              'Share your referral link with a student friend.',
              'They sign up using your link.',
              'Once they complete their profile (50%+), your referral is counted.',
              'You earn priority placement and early access to new features.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
