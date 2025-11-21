// frontend/src/pages/InternshipsPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { internshipAPI } from '../services/api';
import { Search, MapPin, Briefcase, Clock, DollarSign, Building2, Filter, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const InternshipsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const abortControllerRef = useRef(null);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    compensationType: searchParams.get('compensationType') || ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Update filters when URL search params change
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchParams]);

  // Debounce search and location inputs to prevent API flood
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedLocation = useDebounce(filters.location, 300);

  // Fetch when debounced values or select filters change
  useEffect(() => {
    fetchInternships();

    // Cleanup: abort pending request on unmount or new request
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch, debouncedLocation, filters.type, filters.compensationType]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.type) params.type = filters.type;
      if (filters.compensationType) params.compensationType = filters.compensationType;

      const response = await internshipAPI.getAll(params);

      if (response.data.success) {
        setInternships(response.data.data.internships);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load internships');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', compensationType: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Find Internships</h1>
          <p className="text-neutral-600">Discover opportunities that match your skills and interests</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="submit"
              className="h-12 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Search
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City or remote"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full h-10 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full h-10 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Compensation</label>
                <select
                  value={filters.compensationType}
                  onChange={(e) => handleFilterChange('compensationType', e.target.value)}
                  className="w-full h-10 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="stipend">Stipend</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-600 mt-4">Loading internships...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-12 text-center">
            <Briefcase className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No internships found</h3>
            <p className="text-neutral-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  onClick={() => navigate(`/dashboard/internships/${internship._id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const InternshipCard = ({ internship, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
            {internship.title}
          </h3>
          <div className="flex items-center text-neutral-600 text-sm">
            <Building2 className="w-4 h-4 mr-1" />
            {internship.organization?.companyInfo?.companyName || 'Company Name'}
          </div>
        </div>
        {internship.featured?.isFeatured && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
        {internship.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {internship.location?.type === 'remote' ? 'Remote' : internship.location?.city || 'Location'}
        </div>
        <div className="flex items-center">
          <Briefcase className="w-4 h-4 mr-1" />
          {internship.location?.type?.charAt(0).toUpperCase() + internship.location?.type?.slice(1) || 'Type'}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          {/* ✅ FIX: Use compensationDisplay virtual field from backend */}
          {internship.compensationDisplay || 'Not specified'}
        </div>
        {internship.timeline?.applicationDeadline && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Deadline: {new Date(internship.timeline.applicationDeadline).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {internship.statistics?.applications || 0} applications
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          internship.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-neutral-100 text-neutral-600'
        }`}>
          {internship.status?.charAt(0).toUpperCase() + internship.status?.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default InternshipsPage;
