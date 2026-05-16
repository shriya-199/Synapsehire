import { useEffect, useState } from 'react';
import { Brain, TrendingUp, Users } from 'lucide-react';
import { aiApi } from '../../features/ai/aiApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function AIAnalyticsPanel() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    aiApi
      .dashboard()
      .then((response) => setDashboard(response.data.data))
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  }, []);

  if (error) {
    return <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>;
  }

  if (!dashboard) {
    return <div className="rounded-[8px] border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading AI analytics...</div>;
  }

  const recommendationCounts = dashboard.recommendationCounts || {};

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <Brain className="text-brand" size={22} />
          <p className="mt-4 text-sm text-slate-500">Evaluations</p>
          <p className="mt-1 text-3xl font-semibold">{dashboard.totalEvaluations}</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <TrendingUp className="text-brand" size={22} />
          <p className="mt-4 text-sm text-slate-500">Avg hiring probability</p>
          <p className="mt-1 text-3xl font-semibold">{dashboard.averageHiringProbability}%</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <Users className="text-brand" size={22} />
          <p className="mt-4 text-sm text-slate-500">Hire recommendations</p>
          <p className="mt-1 text-3xl font-semibold">{(recommendationCounts.STRONG_HIRE || 0) + (recommendationCounts.HIRE || 0)}</p>
        </div>
      </div>

      <div className="rounded-[8px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-semibold">Recent AI evaluations</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(dashboard.recentEvaluations || []).map((evaluation) => (
            <div key={evaluation._id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold">{evaluation.recommendation}</p>
                <p className="mt-1 text-sm text-slate-600">{evaluation.summary}</p>
              </div>
              <div className="text-sm font-semibold text-brand">{evaluation.scores?.hiringProbability || 0}%</div>
            </div>
          ))}
          {!dashboard.recentEvaluations?.length ? <div className="p-4 text-sm text-slate-500">No AI evaluations yet.</div> : null}
        </div>
      </div>
    </section>
  );
}
