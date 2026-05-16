import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, ShieldCheck } from 'lucide-react';
import { logout } from '../features/auth/authSlice';

export function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">SynapseHire</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome, {user?.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{user?.role} dashboard access is active.</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="flex h-10 items-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
        <section className="mt-8 rounded-[8px] border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand" />
            <h2 className="text-lg font-semibold">Authentication profile</h2>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</dt>
              <dd className="mt-1 text-sm font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Provider</dt>
              <dd className="mt-1 text-sm font-medium">{user?.authProvider}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            {user?.role === 'RECRUITER' || user?.role === 'ADMIN' ? (
              <>
                <Link to="/recruiter/assessments" className="rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-white">
                  Create assessment
                </Link>
                <Link to="/recruiter/interviews/new" className="rounded-[8px] bg-brand px-4 py-2 text-sm font-semibold text-white">
                  Schedule interview
                </Link>
                <Link to="/recruiter/interviews" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
                  View interviews
                </Link>
              </>
            ) : null}
            <Link to="/otp" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
              Verify OTP
            </Link>
            <Link to="/sessions" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
              Manage sessions
            </Link>
            {user?.role === 'RECRUITER' || user?.role === 'ADMIN' ? (
              <>
                <Link to="/analytics/recruiter" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
                  Analytics
                </Link>
                <Link to="/ai/analytics" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
                  AI analytics
                </Link>
              </>
            ) : null}
            {user?.role === 'CANDIDATE' ? (
              <>
                <Link to="/candidate/profile" className="rounded-[8px] bg-brand px-4 py-2 text-sm font-semibold text-white">
                  Upload resume
                </Link>
                <Link to="/analytics/candidate" className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold">
                  My analytics
                </Link>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
