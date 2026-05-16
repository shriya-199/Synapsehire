import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, CheckCircle2, Star, Users } from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { PerformanceChart } from '../../components/analytics/PerformanceChart';
import { loadCandidateAnalytics } from '../../features/analytics/analyticsSlice';

export function CandidateAnalyticsDashboard() {
  const dispatch = useDispatch();
  const { candidate, status, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(loadCandidateAnalytics());
  }, [dispatch]);

  const cards = candidate?.cards || {};

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Candidate analytics</p>
          <h1 className="mt-2 text-3xl font-semibold">Your interview performance</h1>
          <p className="mt-2 text-sm text-slate-600">{status === 'loading' ? 'Refreshing your analytics...' : 'Review your interview history and AI feedback trends.'}</p>
        </header>

        {error ? <div className="rounded-[8px] bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <AnalyticsCard title="Interviews" value={cards.interviews || 0} icon={Users} />
          <AnalyticsCard title="Completed" value={cards.completed || 0} icon={CheckCircle2} />
          <AnalyticsCard title="Average score" value={`${cards.averageScore || 0}%`} icon={BarChart3} />
          <AnalyticsCard title="Top signal" value={cards.strongestSignal || 'Pending'} icon={Star} tone="accent" />
        </section>

        <PerformanceChart data={candidate?.performance || []} />

        <section className="rounded-[8px] border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-semibold">Recent feedback</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(candidate?.reports || []).map((report) => (
              <div key={report._id} className="p-4">
                <p className="text-sm font-semibold">{report.recommendation}</p>
                <p className="mt-1 text-sm text-slate-600">{report.summary}</p>
              </div>
            ))}
            {!candidate?.reports?.length ? <div className="p-4 text-sm text-slate-500">No interview feedback yet.</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
