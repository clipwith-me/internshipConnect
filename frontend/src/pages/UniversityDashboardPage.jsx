// frontend/src/pages/UniversityDashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, FileText, CheckCircle2, Copy, Check, Building2, ArrowRight } from 'lucide-react';
import { universityAPI } from '../services/api';

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="bg-white border border-neutral-200 rounded-2xl p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tint}`}>
      <Icon size={20} />
    </div>
    <p className="text-3xl font-bold text-neutral-900 leading-none">{value}</p>
    <p className="text-sm text-neutral-500 mt-1.5">{label}</p>
  </div>
);

const UniversityDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    universityAPI.getDashboard()
      .then((res) => { if (alive) setData(res.data.data); })
      .catch((err) => { if (alive) setError(err.response?.data?.message || 'Failed to load dashboard'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const copyCode = () => {
    if (!data?.university?.joinCode) return;
    navigator.clipboard?.writeText(data.university.joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">{error}</div>
      </div>
    );
  }

  const k = data.kpis;
  const placementRate = k.applicationsSubmitted > 0
    ? Math.round((k.placements / k.applicationsSubmitted) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{data.university.name}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Career services dashboard · your students on InternshipConnect</p>
        </div>
        <Link
          to="/dashboard/university/students"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          View student roster <ArrowRight size={16} />
        </Link>
      </div>

      {/* Join code banner */}
      <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-700">Your university join code</p>
          <p className="text-xs text-neutral-500 mt-0.5">Share this with your students so they can link their account to {data.university.name}.</p>
        </div>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-primary-300 rounded-xl font-mono text-lg font-bold text-primary-700 hover:border-primary-500 transition-colors self-start"
        >
          {data.university.joinCode}
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-neutral-400" />}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Students on platform" value={k.totalStudents} tint="bg-primary-100 text-primary-600" />
        <StatCard icon={Activity} label="Active (applied ≥1)" value={k.activeStudents} tint="bg-blue-100 text-blue-600" />
        <StatCard icon={FileText} label="Applications submitted" value={k.applicationsSubmitted} tint="bg-amber-100 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Placements secured" value={k.placements} tint="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placement rate */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">Placement rate</h3>
          <p className="text-xs text-neutral-500 mb-4">Share of applications that turned into accepted offers.</p>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-emerald-600">{placementRate}%</span>
            <span className="text-sm text-neutral-500 mb-1.5">{k.placements} of {k.applicationsSubmitted} applications</span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${placementRate}%` }} />
          </div>
        </div>

        {/* Top employers */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-1">Top employers hiring your students</h3>
          <p className="text-xs text-neutral-500 mb-4">By application volume.</p>
          {data.topEmployers?.length ? (
            <ul className="space-y-3">
              {data.topEmployers.map((e, i) => (
                <li key={e._id || i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm text-neutral-800">
                    <span className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500"><Building2 size={14} /></span>
                    {e.name || 'Organization'}
                  </span>
                  <span className="text-sm font-semibold text-neutral-600">{e.applications}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400 py-6 text-center">No applications yet. Encourage your students to start applying.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboardPage;
