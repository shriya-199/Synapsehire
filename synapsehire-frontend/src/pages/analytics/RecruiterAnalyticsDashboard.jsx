import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, AlertTriangle, Brain, CheckCircle2, Users } from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { DashboardFilters } from '../../components/analytics/DashboardFilters';
import { FunnelChart } from '../../components/analytics/FunnelChart';
import { PerformanceChart } from '../../components/analytics/PerformanceChart';
import { SkillHeatmap } from '../../components/analytics/SkillHeatmap';
import { InterviewReportsTable } from '../../components/analytics/InterviewReportsTable';
import { analyticsApi } from '../../features/analytics/analyticsApi';
import { loadAdminControls, loadRecruiterAnalytics, setAnalyticsFilters } from '../../features/analytics/analyticsSlice';

export function RecruiterAnalyticsDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { filters, overview, funnel, performance, skills, reports, admin, status, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(loadRecruiterAnalytics(filters));
    if (user?.role === 'ADMIN') dispatch(loadAdminControls());
  }, [dispatch, filters, user?.role]);

  const exportReports = () => {
    window.location.href = analyticsApi.exportReportsUrl(filters);
  };

  const cards = overview?.cards || {};

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">SynapseHire analytics</p>
            <h1 className="mt-2 text-3xl font-semibold">Recruiter dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track funnel health, candidate performance, AI recommendations, skill coverage, reports, and operational alerts.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
            {status === 'loading' ? 'Refreshing' : 'Live data'}
          </span>
        </header>

        <DashboardFilters filters={filters} onChange={(next) => dispatch(setAnalyticsFilters(next))} onExport={exportReports} />

        {error ? <div className="rounded-[8px] bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <AnalyticsCard title="Interviews" value={cards.totalInterviews || 0} caption="In selected range" icon={Users} />
          <AnalyticsCard title="Completed" value={cards.completedInterviews || 0} caption="Finished sessions" icon={CheckCircle2} tone="ink" />
          <AnalyticsCard title="Avg AI score" value={`${cards.averageHiringProbability || 0}%`} caption="Hiring probability" icon={Brain} />
          <AnalyticsCard title="High intent" value={cards.highIntentCandidates || 0} caption="Lean hire or better" icon={Activity} tone="accent" />
          <AnalyticsCard title="Alerts" value={cards.alerts || 0} caption="Monitoring signals" icon={AlertTriangle} tone="accent" />
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <FunnelChart data={funnel} />
          <PerformanceChart data={performance} />
        </section>

        <SkillHeatmap skills={skills} />

        {user?.role === 'ADMIN' && admin ? (
          <section className="rounded-[8px] border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Admin controls</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Object.entries(admin.totals).map(([key, value]) => (
                <div key={key} className="rounded-[8px] bg-slate-50 p-4">
                  <p className="text-sm capitalize text-slate-500">{key}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <InterviewReportsTable reports={reports} search={filters.search} />
      </div>
    </main>
  );
}
