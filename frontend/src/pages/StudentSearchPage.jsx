// frontend/src/pages/StudentSearchPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FeaturedBadge } from '../components';
import { Search, Filter, User, MapPin, BookOpen, Briefcase, Mail } from 'lucide-react';

/**
 * StudentSearchPage Component
 * Allows organizations to search for talented students
 * Featured profiles (Pro subscribers) appear first
 */
const StudentSearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    education: '',
    location: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalStudents: 0
  });

  // Redirect non-organizations
  useEffect(() => {
    if (user && user.role !== 'organization') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mock API call - replace with actual API when backend is ready
  const searchStudents = async (page = 1) => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await studentAPI.search({
      //   search: searchQuery,
      //   skills: filters.skills,
      //   education: filters.education,
      //   location: filters.location,
      //   page
      // });

      // Mock data for demonstration
      const mockStudents = [
        {
          _id: '1',
          personalInfo: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            location: { city: 'San Francisco', country: 'USA' },
            profilePicture: { url: null }
          },
          bio: 'Full-stack developer passionate about React and Node.js',
          headline: 'Computer Science Student | Full Stack Developer',
          skills: [
            { name: 'JavaScript', level: 'advanced' },
            { name: 'React', level: 'advanced' },
            { name: 'Node.js', level: 'intermediate' }
          ],
          education: [
            { institution: 'Stanford University', degree: 'bachelor', major: 'Computer Science' }
          ],
          experience: [
            { title: 'Software Engineering Intern', company: 'Tech Corp' }
          ],
          featured: {
            isFeatured: true,
            priority: 90
          },
          user: {
            email: 'sarah.j@example.com',
            subscription: { plan: 'pro' }
          },
          profileCompleteness: 95
        },
        {
          _id: '2',
          personalInfo: {
            firstName: 'Michael',
            lastName: 'Chen',
            location: { city: 'New York', country: 'USA' },
            profilePicture: { url: null }
          },
          bio: 'Data science enthusiast with strong analytical skills',
          headline: 'Data Science Student | Python Expert',
          skills: [
            { name: 'Python', level: 'advanced' },
            { name: 'Machine Learning', level: 'intermediate' },
            { name: 'SQL', level: 'advanced' }
          ],
          education: [
            { institution: 'MIT', degree: 'bachelor', major: 'Data Science' }
          ],
          experience: [
            { title: 'Data Analyst Intern', company: 'Analytics Inc' }
          ],
          featured: {
            isFeatured: false,
            priority: 0
          },
          user: {
            email: 'michael.c@example.com',
            subscription: { plan: 'free' }
          },
          profileCompleteness: 85
        }
      ];

      setStudents(mockStudents);
      setPagination({
        current: page,
        total: 1,
        count: mockStudents.length,
        totalStudents: mockStudents.length
      });
      setError(null);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'organization') {
      searchStudents();
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchStudents(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  if (user?.role !== 'organization') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Talented Students</h1>
          <p className="mt-1 text-gray-600">
            Discover skilled students for your internship opportunities
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, bio, headline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <input
                  type="text"
                  placeholder="Skills (e.g., JavaScript, Python)"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={filters.education}
                  onChange={(e) => handleFilterChange('education', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Education Levels</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                  <option value="bootcamp">Bootcamp</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{pagination.totalStudents}</span> students
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Featured profiles shown first</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-gray-600">Searching for students...</p>
            </div>
          </div>
        )}

        {/* Students Grid */}
        {!loading && students.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {students.map((student) => (
              <div
                key={student._id}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      {student.personalInfo.profilePicture?.url ? (
                        <img
                          src={student.personalInfo.profilePicture.url}
                          alt={`${student.personalInfo.firstName} ${student.personalInfo.lastName}`}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-blue-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.personalInfo.firstName} {student.personalInfo.lastName}
                        </h3>
                        {student.featured?.isFeatured && (
                          <FeaturedBadge variant="default" size="sm" />
                        )}
                      </div>
                      {student.headline && (
                        <p className="mb-2 text-sm text-gray-600">{student.headline}</p>
                      )}
                      {student.personalInfo.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {student.personalInfo.location.city}, {student.personalInfo.location.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Completeness */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Profile</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {student.profileCompleteness}%
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {student.bio && (
                  <p className="mb-4 text-sm text-gray-700 line-clamp-2">{student.bio}</p>
                )}

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <Briefcase className="h-3 w-3" />
                      <span>Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {student.skills.length > 5 && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          +{student.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {student.education && student.education.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <BookOpen className="h-3 w-3" />
                      <span>Education</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {student.education[0].institution}
                      {student.education[0].major && ` - ${student.education[0].major}`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 border-t border-gray-200 pt-4">
                  <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    View Profile
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    <Mail className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No students found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => searchStudents(page)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  page === pagination.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearchPage;
