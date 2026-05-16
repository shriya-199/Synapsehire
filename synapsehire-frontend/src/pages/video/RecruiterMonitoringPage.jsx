import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertFeed } from '../../components/video/AlertFeed';
import { monitoringApi } from '../../features/monitoring/monitoringApi';
import { useInterviewSocket } from '../../hooks/useInterviewSocket';
import { getApiErrorMessage } from '../../lib/apiClient';

export function RecruiterMonitoringPage() {
  const { interviewId } = useParams();
  const socketRef = useInterviewSocket(interviewId);
  const connected = useSelector((state) => state.interview.connected);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    monitoringApi
      .dashboard(interviewId)
      .then((response) => setDashboard(response.data.data))
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  }, [interviewId]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 5000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const onAlert = (payload) => {
      setDashboard((current) => {
        if (!current) return current;
        return {
          ...current,
          totalAlerts: current.totalAlerts + 1,
          maxRiskScore: Math.max(current.maxRiskScore || 0, payload.alert.score || 0),
          openCritical: payload.alert.severity === 'CRITICAL' ? (current.openCritical || 0) + 1 : current.openCritical,
          recentAlerts: [payload.alert, ...(current.recentAlerts || [])].slice(0, 25)
        };
      });
    };

    socket.on('monitoring:flag', onAlert);
    return () => socket.off('monitoring:flag', onAlert);
  }, [connected, socketRef]);

  const acknowledge = async (alertId) => {
    await monitoringApi.acknowledge(alertId);
    load();
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Recruiter monitoring</p>
          <h1 className="mt-2 text-3xl font-semibold">Anti-cheating dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Review browser, camera, audio, screen share, and recording signals for this interview.</p>
        </div>

        {error ? <div className="mb-4 rounded-[8px] bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total alerts</p>
            <p className="mt-2 text-3xl font-semibold">{dashboard?.totalAlerts || 0}</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Max risk score</p>
            <p className="mt-2 text-3xl font-semibold">{dashboard?.maxRiskScore || 0}</p>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Open critical</p>
            <p className="mt-2 text-3xl font-semibold">{dashboard?.openCritical || 0}</p>
          </div>
        </div>

        <AlertFeed alerts={dashboard?.recentAlerts || []} onAcknowledge={acknowledge} />
      </div>
    </main>
  );
}
