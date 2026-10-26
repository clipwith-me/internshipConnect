import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Briefcase, Download, Eye, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import { Alert, Button, PageHeader } from '../components';
import MetricsCard from '../components/MetricsCard';
import ApplicationTrendChart from '../components/ApplicationTrendChart';
import DemographicsCharts from '../components/DemographicsCharts';

const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [fetchedAt, setFetchedAt] = useState(null);

  const isOrg = user?.role === 'organization';

  const load = useCallback(
    async (refresh = false) => {
      refresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const res = await analyticsAPI.getOverview(range);
        setAnalytics(res.data?.data);
        setFetchedAt(new Date());
      } catch {
        setError('We could not load your analytics. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    document.title = 'Analytics | InternshipConnect';
  }, []);

  useEffect(() => {
    if (isOrg) load();
  }, [isOrg, load]);

  if (user && !isOrg) return <Navigate to="/dashboard" replace />;

  const exportCsv = () => {
    const rows = analytics?.topInternships || [];
    const lines = [
      ['Title', 'Applications', 'Views', 'Conversion'].map(csvCell).join(','),
      ...rows.map((r) => [r.title, r.applications, r.views, r.conversionRate].map(csvCell).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listing-performance-${range}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const o = analytics?.overview;
  const top = analytics?.topInternships || [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Analytics"
        description="How your listings are performing."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <label htmlFor="range" className="sr-only">Time range</label>
              <select id="range" value={range} onChange={(e) => setRange(e.target.value)} disabled={loading} className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30">
                {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <Button variant="secondary" onClick={() => load(true)} loading={refreshing} icon={<RefreshCw size={16} aria-hidden="true" />}>Refresh</Button>
            <Button variant="secondary" onClick={exportCsv} disabled={loading || top.length === 0} icon={<Download size={16} aria-hidden="true" />}>Export CSV</Button>
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mb-5">
          {error}{' '}
          <button type="button" onClick={() => load()} className="font-semibold underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">Try again</button>
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard label="Listings" value={o?.totalInternships || 0} icon={Briefcase} color="blue" subtitle={`${o?.activeInternships || 0} open`} loading={loading} />
        <MetricsCard label="Applications" value={o?.totalApplications || 0} icon={Users} color="green" loading={loading} />
        <MetricsCard label="Views" value={o?.totalViews || 0} icon={Eye} color="purple" loading={loading} />
        <MetricsCard label="Applications per view" value={o?.conversionRate || '0%'} icon={TrendingUp} color="orange" subtitle="Applications / views" loading={loading} />
      </div>

      <div className="mb-6">
        <ApplicationTrendChart data={analytics?.trends || []} loading={loading} />
      </div>

      {top.length > 0 && (
        <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Top listings</h2>
          <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Top listings table, scrolls sideways on small screens">
            <table className="w-full min-w-[28rem] text-sm">
              <caption className="sr-only">Listings ranked by applications</caption>
              <thead className="border-b border-neutral-200 text-left text-neutral-600">
                <tr>
                  <th scope="col" className="pb-3 font-semibold">Listing</th>
                  <th scope="col" className="pb-3 text-right font-semibold">Applications</th>
                  <th scope="col" className="pb-3 text-right font-semibold">Views</th>
                  <th scope="col" className="pb-3 text-right font-semibold">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {top.map((t, i) => (
                  <tr key={t.id || i}>
                    <th scope="row" className="py-3 text-left font-medium text-neutral-900">{t.title}</th>
                    <td className="py-3 text-right tabular text-neutral-900">{t.applications}</td>
                    <td className="py-3 text-right tabular text-neutral-700">{t.views}</td>
                    <td className="py-3 text-right tabular font-medium text-primary-700">{t.conversionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <DemographicsCharts demographics={{ ...analytics?.demographics, statusBreakdown: analytics?.statusBreakdown }} loading={loading} />

      {fetchedAt && <p className="mt-6 text-center text-sm text-neutral-600">Updated {fetchedAt.toLocaleTimeString('en-GB')}</p>}
    </div>
  );
}
