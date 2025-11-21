// frontend/src/pages/MyInternshipsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import { Plus, Edit, Trash2, Eye, TrendingUp, Users, AlertCircle } from 'lucide-react';

const MyInternshipsPage = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchMyInternships();
  }, []);

  const fetchMyInternships = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await internshipAPI.getMyInternships();
      if (response.data.success) {
        setInternships(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await internshipAPI.publish(id);
      fetchMyInternships();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish internship');
    }
  };

  const handleDelete = async () => {
    try {
      await internshipAPI.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      fetchMyInternships();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete internship');
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">My Internships</h1>
            <p className="text-neutral-600">Manage your posted internship opportunities</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/internships/create')}
            className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Post Internship
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Posted"
            value={internships.length}
            color="blue"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="Active"
            value={internships.filter(i => i.status === 'active').length}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Applications"
            value={internships.reduce((sum, i) => sum + (i.statistics?.applications || 0), 0)}
            color="purple"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Draft"
            value={internships.filter(i => i.status === 'draft').length}
            color="amber"
          />
        </div>

        {/* Internships List */}
        {internships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-12 text-center">
            <Plus className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No internships yet</h3>
            <p className="text-neutral-600 mb-6">Start by posting your first internship opportunity</p>
            <button
              onClick={() => navigate('/dashboard/internships/create')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Post Your First Internship
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Applications</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Posted</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {internships.map((internship) => (
                  <tr key={internship._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{internship.title}</div>
                      <div className="text-sm text-neutral-500">{internship.location?.city || 'Remote'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        internship.status === 'active' ? 'bg-green-100 text-green-700' :
                        internship.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {internship.status?.charAt(0).toUpperCase() + internship.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-900">{internship.statistics?.applications || 0}</td>
                    <td className="px-6 py-4 text-neutral-900">{internship.statistics?.views || 0}</td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">
                      {new Date(internship.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {internship.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(internship._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Publish"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/dashboard/internships/${internship._id}`)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/internships/${internship._id}/edit`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, id: internship._id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scaleIn">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Delete Internship?</h3>
              <p className="text-neutral-600 mb-6">
                This will mark the internship as closed. Applications will be preserved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 h-11 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 h-11 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-neutral-900 mb-1">{value}</div>
      <div className="text-sm text-neutral-600">{label}</div>
    </div>
  );
};

export default MyInternshipsPage;
