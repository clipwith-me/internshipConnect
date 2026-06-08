import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedInternshipsAPI } from '../services/api';
import { Bookmark, MapPin, Clock, DollarSign, Building2, ArrowRight, Calendar, Trash2 } from 'lucide-react';

const SavedInternshipsPage = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedInternshipsAPI.getAll();
      setSaved(res.data.data || []);
    } catch {
      setError('Failed to load saved internships');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (internshipId, e) => {
    e.stopPropagation();
    setRemoving(internshipId);
    try {
      await savedInternshipsAPI.unsave(internshipId);
      setSaved(prev => prev.filter(s => s.internship?._id !== internshipId));
    } catch {
      // silently fail
    } finally {
      setRemoving(null);
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDeadlineBadge = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days === null) return null;
    if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Closed</span>;
    if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Closes in {days}d</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{days} days left</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 mb-4 animate-pulse">
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Saved Internships</h1>
          {saved.length > 0 && (
            <span className="ml-2 text-sm bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
              {saved.length}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {saved.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved internships yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Bookmark internships you're interested in and come back to apply later.</p>
            <button
              onClick={() => navigate('/internships')}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Browse Opportunities <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {saved.map(({ internship, savedAt }) => {
            if (!internship) return null;
            const deadline = internship.applicationDeadline || internship.deadline;
            const org = internship.organization;
            const orgName = org?.companyInfo?.name || 'Unknown Company';
            const logo = org?.companyInfo?.logo;

            return (
              <div
                key={internship._id}
                onClick={() => navigate(`/internships/${internship._id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Company logo */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {logo ? (
                      <img src={logo} alt={orgName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{orgName.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {internship.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{orgName}</p>
                      </div>
                      <button
                        onClick={(e) => handleUnsave(internship._id, e)}
                        disabled={removing === internship._id}
                        className="flex-shrink-0 p-1.5 rounded-lg text-amber-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      {internship.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {internship.location.city || internship.location}
                        </span>
                      )}
                      {internship.type && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span className="capitalize">{internship.type}</span>
                        </span>
                      )}
                      {internship.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {internship.duration}
                        </span>
                      )}
                      {internship.compensation?.amount ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-3 h-3" />
                          {internship.compensation.currency || '₦'}{internship.compensation.amount.toLocaleString()}/mo
                        </span>
                      ) : (
                        <span className="text-gray-400">Unpaid</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {deadline && getDeadlineBadge(deadline)}
                        {deadline && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Deadline: {new Date(deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        Saved {new Date(savedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/internships/${internship._id}`); }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/internships/${internship._id}`); }}
                    className="px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavedInternshipsPage;
