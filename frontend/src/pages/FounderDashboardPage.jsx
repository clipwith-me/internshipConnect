import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

// ─── Colour palette ───────────────────────────────────────────────────────────
const AMBER  = '#F59E0B';
const NAVY   = '#0F172A';
const TEAL   = '#0D9488';
const ROSE   = '#F43F5E';
const VIOLET = '#7C3AED';
const COLORS = [AMBER, TEAL, ROSE, VIOLET, '#22C55E', '#3B82F6'];

// ─── Stat card ───────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, color = AMBER, icon }) {
  return (
    <div style={{ background: '#1E293B', borderRadius: 12, padding: '20px 24px', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{title}</p>
          <p style={{ color: '#F1F5F9', fontSize: 28, fontWeight: 700, margin: '6px 0 2px' }}>{value}</p>
          {sub && <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>{sub}</p>}
        </div>
        {icon && <span style={{ fontSize: 28 }}>{icon}</span>}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#F1F5F9', fontSize: 18, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────
function ChartCard({ title, children, height = 280 }) {
  return (
    <div style={{ background: '#1E293B', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{title}</p>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
};

const founderAPI = {
  overview:    () => api.get('/founder-analytics/overview'),
  userGrowth:  () => api.get('/founder-analytics/user-growth'),
  marketplace: () => api.get('/founder-analytics/marketplace'),
  funnel:      () => api.get('/founder-analytics/funnel'),
  geographic:  () => api.get('/founder-analytics/geographic'),
  revenue:     () => api.get('/founder-analytics/revenue'),
  insights:    () => api.get('/founder-analytics/insights'),
  realtime:    () => api.get('/founder-analytics/realtime'),
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Growth', 'Marketplace', 'Funnel', 'Geographic', 'AI Insights'];

// ════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════
export default function FounderDashboardPage() {
  const [tab, setTab]         = useState('Overview');
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [rtData, setRtData]   = useState(null);

  const fetchTab = useCallback(async (t) => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = {
        Overview:   ['overview'],
        Growth:     ['overview', 'userGrowth'],
        Marketplace:['marketplace'],
        Funnel:     ['funnel'],
        Geographic: ['geographic'],
        'AI Insights': ['insights'],
      };
      const keys = endpoints[t] || [];
      const results = await Promise.all(keys.map(k => founderAPI[k]()));
      const merged = {};
      keys.forEach((k, i) => { merged[k] = results[i].data.data; });
      setData(prev => ({ ...prev, ...merged }));
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTab(tab); }, [tab, fetchTab]);

  // Poll realtime every 30 s on Overview
  useEffect(() => {
    if (tab !== 'Overview') return;
    const load = async () => {
      try {
        const res = await founderAPI.realtime();
        setRtData(res.data.data);
      } catch (_) {}
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [tab]);

  // ─── Shared styles ──────────────────────────────────────────────────
  const page  = { minHeight: '100vh', background: NAVY, color: '#F1F5F9', fontFamily: 'Inter, sans-serif', padding: '24px 32px' };
  const tabs  = { display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' };
  const tabSt = (active) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 14,
    background: active ? AMBER : '#1E293B',
    color: active ? NAVY : '#94A3B8',
    transition: 'all 0.15s',
  });
  const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 };
  const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 };

  const ov  = data.overview   || {};
  const gw  = data.userGrowth || {};
  const mp  = data.marketplace || {};
  const fn  = data.funnel      || {};
  const geo = data.geographic  || {};
  const ins = data.insights    || {};

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          🚀 Founder Dashboard
        </h1>
        <p style={{ color: '#64748B', marginTop: 4 }}>
          Real-time platform intelligence — {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Tabs */}
      <div style={tabs}>
        {TABS.map(t => (
          <button key={t} style={tabSt(tab === t)} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading && <div style={{ color: '#64748B', padding: 40, textAlign: 'center' }}>Loading...</div>}
      {error   && <div style={{ color: ROSE, padding: 16, background: '#1E293B', borderRadius: 8, marginBottom: 16 }}>Error: {error}</div>}

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {!loading && tab === 'Overview' && ov.users && (
        <>
          <div style={grid4}>
            <KpiCard title="Total Users"           value={fmt(ov.users.total)}            sub={`+${ov.users.newToday} today`}   icon="👥" color={AMBER} />
            <KpiCard title="Active Internships"    value={fmt(ov.marketplace?.activeInternships)} sub="Live opportunities"        icon="💼" color={TEAL} />
            <KpiCard title="Total Applications"    value={fmt(ov.marketplace?.totalApplications)} sub="Platform-wide"             icon="📄" color={VIOLET} />
            <KpiCard title="Placement Rate"        value={`${ov.placements?.placementRate}%`}     sub="Applications → Accepted"  icon="🎯" color={ROSE} />
          </div>

          <div style={grid4}>
            <KpiCard title="Students"   value={fmt(ov.users.students)}         sub="Registered"              icon="🎓" color={AMBER} />
            <KpiCard title="Employers"  value={fmt(ov.users.employers)}         sub="Organisations"           icon="🏢" color={TEAL} />
            <KpiCard title="New / Month" value={fmt(ov.users.newThisMonth)}    sub={`${ov.users.monthlyGrowthRate > 0 ? '+' : ''}${ov.users.monthlyGrowthRate}% vs last month`} icon="📈" color={VIOLET} />
            <KpiCard title="Avg Profile" value={`${ov.profile?.avgCompleteness}%`} sub="Completeness"        icon="✅" color={ROSE} />
          </div>

          <Section title="User Growth (Last 30 Days)">
            <ChartCard title="">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ov.trends?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="_id" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Area type="monotone" dataKey="count" stroke={AMBER} fill={AMBER + '33'} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Section>

          {/* Realtime feed */}
          {rtData && (
            <Section title={`⚡ Live Activity (refreshes every 30s)`}>
              <div style={grid4}>
                <KpiCard title="Signups / hour"   value={rtData.live.signupsLastHour}           icon="⚡" color={AMBER} />
                <KpiCard title="Apps / hour"      value={rtData.live.applicationsLastHour}       icon="📨" color={TEAL} />
                <KpiCard title="Apps / 30 min"    value={rtData.live.applicationsLast30Min}      icon="🕐" color={VIOLET} />
                <KpiCard title="New Internships"  value={rtData.live.newInternshipsToday} sub="today" icon="💼" color={ROSE} />
              </div>
              <ChartCard title="Recent Applications (last 30 min)" height={200}>
                <div style={{ overflow: 'auto', maxHeight: 180 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ color: '#64748B' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Position</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Time</th>
                    </tr></thead>
                    <tbody>
                      {rtData.feed.recentApplications.map(a => (
                        <tr key={a.id} style={{ borderTop: '1px solid #334155' }}>
                          <td style={{ padding: '6px 8px' }}>{a.internshipTitle}</td>
                          <td style={{ padding: '6px 8px', color: '#64748B' }}>{new Date(a.appliedAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </Section>
          )}
        </>
      )}

      {/* ══════════ GROWTH TAB ══════════ */}
      {!loading && tab === 'Growth' && gw.daily && (
        <>
          <div style={grid4}>
            <KpiCard title="Students (total)"   value={fmt(gw.byRole?.student)}       icon="🎓" color={AMBER} />
            <KpiCard title="Employers (total)"  value={fmt(gw.byRole?.organization)}  icon="🏢" color={TEAL} />
            <KpiCard title="Active Students"    value={fmt(gw.engagement?.activeStudents)} sub="Ever applied" icon="🔥" color={ROSE} />
            <KpiCard title="Engagement Rate"    value={`${gw.engagement?.engagementRate}%`} sub="of students applied" icon="💡" color={VIOLET} />
          </div>

          <div style={grid2}>
            <ChartCard title="Daily Signups (90 days)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gw.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Area type="monotone" dataKey="students"  stroke={AMBER}  fill={AMBER  + '22'} name="Students" stackId="1" />
                  <Area type="monotone" dataKey="employers" stroke={TEAL}   fill={TEAL   + '22'} name="Employers" stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Monthly Growth (12 months)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gw.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="_id" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Legend />
                  <Bar dataKey="students"  fill={AMBER}  name="Students" radius={[4,4,0,0]} />
                  <Bar dataKey="employers" fill={TEAL}   name="Employers" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* ══════════ MARKETPLACE TAB ══════════ */}
      {!loading && tab === 'Marketplace' && mp.internships && (
        <>
          <div style={grid4}>
            <KpiCard title="Conversion Rate"  value={`${mp.applications?.conversionRate}%`}  sub="Applied → Accepted" icon="✅" color={AMBER} />
            <KpiCard title="Offer Rate"        value={`${mp.applications?.offerRate}%`}       sub="Applied → Offered"  icon="💌" color={TEAL} />
            <KpiCard title="Active Internships" value={fmt(mp.internships?.byStatus?.find?.(s => s._id === 'active')?.count || 0)} icon="💼" color={VIOLET} />
            <KpiCard title="Top Employer"       value={mp.companies?.top?.[0]?.name || '—'} sub={`${mp.companies?.top?.[0]?.postings || 0} postings`} icon="🏢" color={ROSE} />
          </div>
          <div style={grid2}>
            <ChartCard title="Applications by Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mp.applications?.byStatus || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                    {(mp.applications?.byStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Daily Applications (30 days)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mp.applications?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Line type="monotone" dataKey="count" stroke={AMBER} strokeWidth={2} dot={false} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <Section title="Top Industries">
            <ChartCard title="" height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mp.internships?.byIndustry || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="_id" stroke="#64748B" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Bar dataKey="count" fill={TEAL} name="Internships" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Section>
        </>
      )}

      {/* ══════════ FUNNEL TAB ══════════ */}
      {!loading && tab === 'Funnel' && fn.funnel && (
        <>
          <div style={grid4}>
            <KpiCard title="Overall Placement" value={`${fn.summary?.placementRate}%`} sub="Registered → Placed" icon="🎯" color={AMBER} />
            <KpiCard title="Total Placed"      value={fmt(fn.summary?.totalPlaced)}   sub="Students accepted"   icon="🏆" color={TEAL} />
            <KpiCard title="Total Students"    value={fmt(fn.summary?.totalStudents)} icon="🎓" color={VIOLET} />
          </div>
          <Section title="Placement Funnel">
            <ChartCard title="" height={380}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fn.funnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" stroke="#64748B" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }}
                    formatter={(v, n, p) => [v, n === 'count' ? 'Students' : 'Drop-off']}
                  />
                  <Legend />
                  <Bar dataKey="count"   fill={AMBER} name="Remaining" radius={[0,4,4,0]} />
                  <Bar dataKey="dropOff" fill={ROSE}  name="Drop-off"  radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Section>
          <Section title="Stage-by-Stage Drop-off">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ color: '#64748B', borderBottom: '1px solid #334155' }}>
                    {['Stage','Count','% of Previous','Drop-off','Drop-off %'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fn.funnel.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '8px 12px' }}>{row.stage}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{fmt(row.count)}</td>
                      <td style={{ padding: '8px 12px', color: TEAL }}>{row.pctOfPrev}%</td>
                      <td style={{ padding: '8px 12px', color: ROSE }}>{fmt(row.dropOff)}</td>
                      <td style={{ padding: '8px 12px', color: row.dropOffPct > 30 ? ROSE : '#64748B' }}>{row.dropOffPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {/* ══════════ GEOGRAPHIC TAB ══════════ */}
      {!loading && tab === 'Geographic' && geo.students && (
        <>
          <div style={grid2}>
            <ChartCard title="Students by City (Top 20)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geo.students?.byCity || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="city" stroke="#64748B" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Bar dataKey="count" fill={AMBER} name="Students" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Students by Nationality">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={geo.students?.byCountry || []} dataKey="count" nameKey="country" cx="50%" cy="50%" outerRadius={90} label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}>
                    {(geo.students?.byCountry || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <Section title="Top Employer Headquarters">
            <ChartCard title="" height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geo.employers?.byCity || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="city" stroke="#64748B" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', color: '#F1F5F9' }} />
                  <Bar dataKey="count" fill={TEAL} name="Employers" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Section>
        </>
      )}

      {/* ══════════ AI INSIGHTS TAB ══════════ */}
      {!loading && tab === 'AI Insights' && ins.insights && (
        <>
          <p style={{ color: '#64748B', marginBottom: 20, fontSize: 14 }}>
            Generated {new Date(ins.generatedAt).toLocaleString()} · Powered by live platform data
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ins.insights.map((insight, i) => {
              const bg = insight.severity === 'positive'    ? '#052E16'
                       : insight.severity === 'warning'     ? '#431407'
                       : insight.severity === 'opportunity' ? '#1E1B4B'
                       : '#1E293B';
              const border = insight.severity === 'positive'    ? '#22C55E'
                           : insight.severity === 'warning'     ? '#F59E0B'
                           : insight.severity === 'opportunity' ? VIOLET
                           : TEAL;
              return (
                <div key={i} style={{ background: bg, borderLeft: `4px solid ${border}`, borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{insight.icon}</span>
                    <div>
                      <span style={{ background: border + '33', color: border, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', marginBottom: 6, display: 'inline-block' }}>
                        {insight.type.replace('_', ' ')}
                      </span>
                      <p style={{ color: '#F1F5F9', margin: 0, lineHeight: 1.6 }}>{insight.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
