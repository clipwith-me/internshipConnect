// frontend/src/pages/admin/UsersManagement.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Users, Building2, Shield, Ban, CheckCircle, Eye, MoreVertical } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', createdAt: '2025-01-15', lastLogin: '2025-01-20', applications: 5 },
        { id: 2, name: 'Tech Corp', email: 'hr@techcorp.com', role: 'organization', status: 'active', createdAt: '2025-01-10', lastLogin: '2025-01-19', internships: 12 },
        { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'student', status: 'active', createdAt: '2025-01-18', lastLogin: '2025-01-20', applications: 3 },
        { id: 4, name: 'StartupXYZ', email: 'contact@startupxyz.com', role: 'organization', status: 'pending', createdAt: '2025-01-19', lastLogin: '2025-01-20', internships: 0 },
        { id: 5, name: 'Bob Johnson', email: 'bob@example.com', role: 'student', status: 'suspended', createdAt: '2024-12-10', lastLogin: '2025-01-15', applications: 1 },
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (userId, action) => {
    console.log(`Action ${action} on user ${userId}`);
    // Implement action logic
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">User Management</h1>
          <p className="text-neutral-600 mt-2">Manage students and organizations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="organization">Organizations</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{users.filter(u => u.role === 'student').length}</div>
                <div className="text-sm text-neutral-600">Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{users.filter(u => u.role === 'organization').length}</div>
                <div className="text-sm text-neutral-600">Organizations</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{users.filter(u => u.status === 'pending').length}</div>
                <div className="text-sm text-neutral-600">Pending Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-neutral-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            {user.role === 'student' ? (
                              <Users className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Building2 className="w-5 h-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{user.name}</div>
                            <div className="text-sm text-neutral-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' :
                          user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {user.role === 'student' ? `${user.applications} applications` : `${user.internships} internships`}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(user.id, 'view')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-neutral-600" />
                          </button>
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleAction(user.id, 'approve')}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleAction(user.id, 'suspend')}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
