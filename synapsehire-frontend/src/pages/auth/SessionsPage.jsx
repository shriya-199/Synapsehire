import { useEffect } from 'react';
import { Monitor, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSessions } from '../../features/auth/authSlice';
import { authApi } from '../../features/auth/authApi';

export function SessionsPage() {
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.auth.sessions);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const revoke = async (sessionId) => {
    await authApi.revokeSession(sessionId);
    dispatch(fetchSessions());
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Active sessions</h1>
        <div className="mt-6 overflow-hidden rounded-[8px] border border-slate-200 bg-white">
          {sessions.map((session) => (
            <div key={session._id} className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-slate-100">
                  <Monitor size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">{session.userAgent || 'Unknown device'}</p>
                  <p className="text-xs text-slate-500">Last used {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : 'recently'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => revoke(session._id)}
                className="flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Revoke session"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!sessions.length ? <div className="p-5 text-sm text-slate-500">No active sessions found.</div> : null}
        </div>
      </div>
    </main>
  );
}
