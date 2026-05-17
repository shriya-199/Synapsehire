import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Code2, MonitorCheck, Video } from 'lucide-react';
import { recruiterApi } from '../../features/recruiter/recruiterApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    recruiterApi
      .listInterviews()
      .then((response) => setInterviews(response.data.data))
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  };

  useEffect(load, []);

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Recruiter</p>
            <h1 className="mt-2 text-3xl font-semibold">Interviews</h1>
            <p className="mt-2 text-sm text-slate-600">Schedule, open, monitor, and review candidate interview sessions.</p>
          </div>
          <Link to="/recruiter/interviews/new" className="rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-white">
            Schedule interview
          </Link>
        </div>

        {error ? <div className="mb-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {interviews.map((interview) => (
              <div key={interview._id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Interview #{interview._id.slice(-6)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Status: {interview.status} · Scheduled: {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : 'Not set'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Score: {interview.finalScore ?? 'Pending'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/assignments/${interview._id}/coding`}>
                    <Code2 size={16} />
                    Assignment
                  </Link>
                  <Link className="flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/interviews/${interview._id}/video`}>
                    <Video size={16} />
                    Interview
                  </Link>
                  <Link className="flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/interviews/${interview._id}/monitoring`}>
                    <MonitorCheck size={16} />
                    Monitor
                  </Link>
                </div>
              </div>
            ))}
            {!interviews.length ? <div className="p-4 text-sm text-slate-500">No interviews scheduled yet.</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
