import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const AMBER = '#F59E0B';
const NAVY  = '#0F172A';
const TEAL  = '#0D9488';
const ROSE  = '#F43F5E';
const VIOLET= '#7C3AED';

function MetricBlock({ label, value, sub, highlight }) {
  return (
    <div style={{ background: '#1E293B', borderRadius: 12, padding: '24px 28px', textAlign: 'center', border: highlight ? `2px solid ${AMBER}` : 'none' }}>
      <p style={{ color: '#64748B', fontSize: 13, margin: 0, marginBottom: 8 }}>{label}</p>
      <p style={{ color: highlight ? AMBER : '#F1F5F9', fontSize: 36, fontWeight: 800, margin: 0 }}>{value}</p>
      {sub && <p style={{ color: '#64748B', fontSize: 12, margin: '6px 0 0' }}>{sub}</p>}
    </div>
  );
}

const fmt = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n ?? 0}`;
};
const fmtN = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
};

export default function InvestorDashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/founder-analytics/investor')
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  const page = { minHeight: '100vh', background: NAVY, color: '#F1F5F9', fontFamily: 'Inter, sans-serif', padding: '40px 48px' };

  if (loading) return <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 18 }}>Loading investor view…</div>;
  if (error)   return <div style={{ ...page, color: ROSE }}>{error}</div>;
  if (!data)   return null;

  const h   = data.headline;
  const imp = data.impact;
  const inv = data.investabilityScore;

  return (
    <div style={page}>
      {/* Masthead */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-block', background: AMBER + '22', border: `1px solid ${AMBER}`, borderRadius: 6, padding: '4px 16px', color: AMBER, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>
          CONFIDENTIAL · INVESTOR VIEW
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 8px', background: `linear-gradient(90deg, ${AMBER}, #FCD34D)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          InternshipConnect
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>Africa's #1 Early-Career Platform · Executive Summary</p>
      </div>

      {/* Investability score */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="68" fill="none" stroke="#1E293B" strokeWidth="14" />
            <circle
              cx="80" cy="80" r="68"
              fill="none" stroke={AMBER} strokeWidth="14"
              strokeDasharray={`${(inv / 100) * 427} 427`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
            <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fill={AMBER} fontSize="32" fontWeight="800">{inv}</text>
            <text x="80" y="104" textAnchor="middle" fill="#64748B" fontSize="11">/100</text>
          </svg>
        </div>
        <p style={{ color: '#94A3B8', marginTop: 8, fontSize: 14 }}>Investability Score</p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 40 }}>
        <MetricBlock label="Registered Users"  value={fmtN(h.totalUsers)}      highlight />
        <MetricBlock label="Student Users"     value={fmtN(h.totalStudents)} />
        <MetricBlock label="Employer Partners" value={fmtN(h.totalEmployers)} />
        <MetricBlock label="MRR"               value={fmt(h.mrr)}              highlight />
        <MetricBlock label="ARR (projected)"   value={fmt(h.arr)} />
        <MetricBlock label="MoM Growth"        value={`${h.userGrowthRate > 0 ? '+' : ''}${h.userGrowthRate}%`} highlight={h.userGrowthRate > 0} />
        <MetricBlock label="Placement Rate"    value={`${h.placementRate}%`} />
        <MetricBlock label="Active Postings"   value={fmtN(h.activeOpportunities)} />
      </div>

      {/* Growth chart */}
      <div style={{ background: '#1E293B', borderRadius: 12, padding: '24px 28px', marginBottom: 32 }}>
        <p style={{ color: '#CBD5E1', fontWeight: 600, marginBottom: 16 }}>Monthly User Growth (12 Months)</p>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.growth?.monthly || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={AMBER} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="_id" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0F172A', border: 'none', color: '#F1F5F9' }} />
              <Legend />
              <Area type="monotone" dataKey="total"    stroke={AMBER}  fill="url(#grad)"  name="Total Users" strokeWidth={2} />
              <Line type="monotone" dataKey="students" stroke={TEAL}   name="Students"    strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="employers"stroke={VIOLET} name="Employers"   strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact stats */}
      <div style={{ background: '#1E293B', borderRadius: 12, padding: '28px 32px', marginBottom: 40 }}>
        <p style={{ color: '#CBD5E1', fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Platform Impact</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
          {[
            { label: 'Students Placed',          value: fmtN(imp.studentsHelped),        icon: '🎓', color: AMBER  },
            { label: 'Internships Posted',        value: fmtN(imp.internshipsPosted),     icon: '💼', color: TEAL   },
            { label: 'Employers Served',          value: fmtN(imp.employersServed),       icon: '🏢', color: VIOLET },
            { label: 'Applications Processed',    value: fmtN(imp.applicationsProcessed), icon: '📄', color: ROSE   },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <p style={{ color: item.color, fontSize: 28, fontWeight: 800, margin: '8px 0 4px' }}>{item.value}</p>
              <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px solid #1E293B', paddingTop: 24 }}>
        <p style={{ color: '#334155', fontSize: 12 }}>
          InternshipConnect · Data as of {new Date().toLocaleDateString()} · All figures are live platform data
        </p>
      </div>
    </div>
  );
}
