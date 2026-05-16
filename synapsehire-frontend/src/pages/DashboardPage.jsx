import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarPlus,
  CheckCircle2,
  Code2,
  FileUp,
  LineChart,
  LogOut,
  MonitorCheck,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { logout } from '../features/auth/authSlice';
import { recruiterApi } from '../features/recruiter/recruiterApi';
import { analyticsApi } from '../features/analytics/analyticsApi';
import { getApiErrorMessage } from '../lib/apiClient';

function ShellHeader({ user, onLogout }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">SynapseHire command center</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {user?.role === 'CANDIDATE'
            ? 'Prepare your profile, join live interviews, and review AI feedback.'
            : 'Create simulations, schedule candidates, monitor interviews, and review hiring intelligence.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white"
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'brand', to }) {
  const toneClass = tone === 'warm' ? 'bg-orange-50 text-orange-700' : tone === 'dark' ? 'bg-ink text-white' : 'bg-brand/10 text-brand';
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${toneClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(15,23,42,0.09)]">
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      {content}
    </div>
  );
}

function ActionCard({ icon: Icon, title, copy, to, primary }) {
  return (
    <Link
      to={to}
      className={`group rounded-[8px] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(15,23,42,0.09)] ${
        primary ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white text-ink'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[8px] ${primary ? 'bg-white/10 text-cyan-200' : 'bg-brand/10 text-brand'}`}>
          <Icon size={21} />
        </div>
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${primary ? 'text-slate-300' : 'text-slate-600'}`}>{copy}</p>
    </Link>
  );
}

function InterviewList({ interviews, role }) {
  if (!interviews.length) {
    return (
      <div className="rounded-[8px] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        {role === 'CANDIDATE' ? 'No interviews assigned yet.' : 'No interviews scheduled yet.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
      {interviews.slice(0, 5).map((interview) => (
        <div key={interview._id} className="grid gap-4 border-b border-slate-100 p-4 last:border-b-0 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-semibold">
              {interview.assessmentId?.title || 'Interview'}{' '}
              <span className="text-sm font-normal text-slate-500">#{interview._id.slice(-6)}</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {role === 'CANDIDATE'
                ? interview.assessmentId?.role || 'Role pending'
                : `${interview.candidateId?.name || 'Candidate'} - ${interview.candidateId?.email || 'Email pending'}`}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              {interview.status} · {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : 'Not scheduled'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/interviews/${interview._id}/room`}>
              <Code2 size={16} />
              Coding
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/interviews/${interview._id}/video`}>
              <Video size={16} />
              Video
            </Link>
            {role !== 'CANDIDATE' ? (
              <Link className="inline-flex items-center gap-2 rounded-[8px] border border-slate-300 px-3 py-2 text-sm font-semibold" to={`/interviews/${interview._id}/monitoring`}>
                <MonitorCheck size={16} />
                Monitor
              </Link>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadinessChart({ data }) {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="dashboardSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f7a8c" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#1f7a8c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Area type="monotone" dataKey="value" stroke="#1f7a8c" strokeWidth={3} fill="url(#dashboardSignal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecruiterDashboard({ data, loading }) {
  const interviews = data.interviews || [];
  const completed = interviews.filter((item) => item.status === 'COMPLETED').length;
  const active = interviews.filter((item) => item.status === 'IN_PROGRESS').length;
  const chartData = [
    { label: 'Assessments', value: data.assessments.length || 1 },
    { label: 'Candidates', value: data.candidates.length || 1 },
    { label: 'Interviews', value: interviews.length || 1 },
    { label: 'Completed', value: completed || 1 }
  ];

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BrainCircuit} label="Assessments" value={loading ? '...' : data.assessments.length} to="/recruiter/assessments" />
        <StatCard icon={UsersRound} label="Candidates" value={loading ? '...' : data.candidates.length} to="/dashboard#candidates" />
        <StatCard icon={PlayCircle} label="Live interviews" value={loading ? '...' : active} tone="warm" to="/recruiter/interviews" />
        <StatCard icon={BarChart3} label="Completed" value={loading ? '...' : completed} tone="dark" to="/analytics/recruiter" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recruiter workflow</h2>
            <Link to="/analytics/recruiter" className="text-sm font-semibold text-brand">Open analytics</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard icon={BrainCircuit} title="Create assessment" copy="Define role, seniority, duration, rubric, and AI evaluation settings." to="/recruiter/assessments" primary />
            <ActionCard icon={CalendarPlus} title="Schedule interview" copy="Match role-based assessments with candidates and generate coding/video rooms." to="/recruiter/interviews/new" />
            <ActionCard icon={MonitorCheck} title="Monitor sessions" copy="Open live interview rooms, video monitoring, and anti-cheating alerts." to="/recruiter/interviews" />
            <ActionCard icon={LineChart} title="AI insights" copy="Review rankings, funnel analytics, performance trends, and reports." to="/ai/analytics" />
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand" />
            <h2 className="font-semibold">Hiring signal</h2>
          </div>
          <ReadinessChart data={chartData} />
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Assessments feed role-calibrated scheduling.</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Interview rooms include coding, video, and monitoring.</p>
            <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Analytics convert activity into recruiter decisions.</p>
          </div>
        </div>
      </section>

      <section id="candidates" className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent interviews</h2>
          <Link to="/recruiter/interviews" className="text-sm font-semibold text-brand">View all</Link>
        </div>
        <InterviewList interviews={interviews} role="RECRUITER" />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">ATS-ranked candidates</h2>
          <Link to="/recruiter/interviews/new" className="text-sm font-semibold text-brand">Schedule top candidate</Link>
        </div>
        <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
          {data.candidates.slice(0, 8).map((candidate, index) => (
            <Link key={candidate._id} to={`/recruiter/candidates/${candidate._id}`} className="grid gap-4 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-ink text-sm font-semibold text-white">#{index + 1}</div>
              <div>
                <p className="font-semibold">{candidate.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {candidate.email} - {candidate.organizationId?.name || 'No company'} - {candidate.candidateProfile?.appliedRole || 'Role not selected'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(candidate.candidateProfile?.techStack || []).slice(0, 6).map((tech) => (
                    <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tech}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-[8px] bg-brand/10 px-4 py-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">ATS</p>
                <p className="text-2xl font-semibold text-ink">{candidate.candidateProfile?.atsScore || 0}%</p>
              </div>
            </Link>
          ))}
          {!data.candidates.length ? <div className="p-4 text-sm text-slate-500">No candidates have selected your company yet.</div> : null}
        </div>
      </section>
    </>
  );
}

function CandidateDashboard({ user, data, loading }) {
  const interviews = data.interviews || [];
  const profile = user?.candidateProfile || {};
  const completed = interviews.filter((item) => item.status === 'COMPLETED').length;
  const profileScore = [profile.appliedRole, profile.resume].filter(Boolean).length * 35 + (interviews.length ? 30 : 0);
  const chartData = [
    { label: 'Profile', value: profile.appliedRole ? 35 : 10 },
    { label: 'Resume', value: profile.resume ? 70 : 20 },
    { label: 'Interview', value: interviews.length ? 88 : 35 },
    { label: 'Feedback', value: completed ? 96 : 50 }
  ];

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileUp} label="Applied role" value={profile.appliedRole || 'Not set'} to="/candidate/profile" />
        <StatCard icon={ShieldCheck} label="Resume" value={profile.resume ? 'Uploaded' : 'Missing'} to="/candidate/profile" />
        <StatCard icon={PlayCircle} label="Interviews" value={loading ? '...' : interviews.length} tone="warm" to={interviews[0]?._id ? `/interviews/${interviews[0]._id}/room` : '/analytics/candidate'} />
        <StatCard icon={BarChart3} label="Completed" value={loading ? '...' : completed} tone="dark" to="/analytics/candidate" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Candidate workflow</h2>
            <Link to="/analytics/candidate" className="text-sm font-semibold text-brand">View feedback</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard icon={FileUp} title="Complete profile" copy="Select your applied role and upload your latest resume before scheduling." to="/candidate/profile" primary />
            <ActionCard icon={Code2} title="Open coding rooms" copy="Join assigned Monaco coding simulations with live collaboration and execution." to={interviews[0]?._id ? `/interviews/${interviews[0]._id}/room` : '/analytics/candidate'} />
            <ActionCard icon={Video} title="Join video interview" copy="Use the video room for live interview sessions and monitoring consent workflows." to={interviews[0]?._id ? `/interviews/${interviews[0]._id}/video` : '/analytics/candidate'} />
            <ActionCard icon={LineChart} title="Review AI feedback" copy="See communication, technical, and hiring probability trends after interviews." to="/analytics/candidate" />
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand" />
            <h2 className="font-semibold">Readiness score</h2>
          </div>
          <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">{Math.min(profileScore, 100)}%</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profile.appliedRole && profile.resume
              ? 'Your candidate profile is ready for recruiter scheduling.'
              : 'Complete your role and resume to unlock better recruiter matching.'}
          </p>
          <ReadinessChart data={chartData} />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Assigned interviews</h2>
          <Link to="/candidate/profile" className="text-sm font-semibold text-brand">Update profile</Link>
        </div>
        <InterviewList interviews={interviews} role="CANDIDATE" />
      </section>
    </>
  );
}

export function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState({ assessments: [], candidates: [], interviews: [], analytics: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (isRecruiter) {
          const [assessments, candidates, interviews] = await Promise.all([
            recruiterApi.listAssessments(),
            recruiterApi.listCandidates(),
            recruiterApi.listInterviews()
          ]);
          if (active) {
            setData({
              assessments: assessments.data.data || [],
              candidates: candidates.data.data || [],
              interviews: interviews.data.data || [],
              analytics: null
            });
          }
        } else {
          const [interviews, analytics] = await Promise.all([
            recruiterApi.listInterviews(),
            analyticsApi.candidate().catch(() => ({ data: { data: null } }))
          ]);
          if (active) {
            setData({
              assessments: [],
              candidates: [],
              interviews: interviews.data.data || [],
              analytics: analytics.data.data
            });
          }
        }
      } catch (apiError) {
        if (active) setError(getApiErrorMessage(apiError));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isRecruiter]);

  const profileLabel = useMemo(() => {
    if (isRecruiter) return 'Recruiter intelligence workspace';
    return user?.candidateProfile?.appliedRole || 'Candidate application workspace';
  }, [isRecruiter, user?.candidateProfile?.appliedRole]);

  return (
    <main className="min-h-screen bg-[#f4f7f6] p-5 text-ink sm:p-6">
      <div className="mx-auto max-w-7xl">
        <ShellHeader user={user} onLogout={() => dispatch(logout())} />

        <section className="mt-6 rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-ink text-cyan-200">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profileLabel}</h2>
                <p className="mt-1 text-sm text-slate-600">{user?.email} · {user?.authProvider || 'LOCAL'} · {user?.role}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/otp" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">Verify OTP</Link>
              <Link to="/sessions" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">Manage sessions</Link>
            </div>
          </div>
        </section>

        {error ? <div className="mt-5 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        {isRecruiter ? <RecruiterDashboard data={data} loading={loading} /> : <CandidateDashboard user={user} data={data} loading={loading} />}
      </div>
    </main>
  );
}
