// frontend/src/pages/UniversityStudentsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { universityAPI } from '../services/api';

const UniversityStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    universityAPI.getStudents()
      .then((res) => { if (alive) setStudents(res.data.data || []); })
      .catch((err) => { if (alive) setError(err.response?.data?.message || 'Failed to load students'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard/university" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-4">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Student roster</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{students.length} student{students.length === 1 ? '' : 's'} linked to your university</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">{error}</div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4"><Users size={22} /></div>
          <h3 className="text-base font-semibold text-neutral-900">No students yet</h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">Share your join code from the dashboard so your students can link their accounts.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-neutral-100">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Course / Institution</th>
                  <th className="px-5 py-3.5 text-center">Applications</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-neutral-900">{s.name}</p>
                      <p className="text-xs text-neutral-500">{s.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{s.course || <span className="text-neutral-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-neutral-700">{s.applications}</td>
                    <td className="px-5 py-3.5 text-center">
                      {s.placed ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Placed</span>
                      ) : s.applications > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Applying</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500">Not started</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityStudentsPage;
