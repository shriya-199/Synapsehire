export function AlertFeed({ alerts, onAcknowledge }) {
  return (
    <aside className="rounded-[8px] border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <h2 className="font-semibold">Real-time alerts</h2>
      </div>
      <div className="max-h-[520px] divide-y divide-slate-100 overflow-auto">
        {alerts.map((alert) => (
          <div key={alert._id || `${alert.type}-${alert.createdAt}`} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{alert.type}</p>
                <p className="mt-1 text-sm text-slate-600">{alert.message || 'Monitoring alert detected.'}</p>
                <p className="mt-2 text-xs text-slate-400">{alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Just now'}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{alert.severity}</span>
            </div>
            {onAcknowledge && !alert.acknowledgedAt ? (
              <button type="button" onClick={() => onAcknowledge(alert._id)} className="mt-3 text-sm font-semibold text-brand">
                Acknowledge
              </button>
            ) : null}
          </div>
        ))}
        {!alerts.length ? <div className="p-4 text-sm text-slate-500">No alerts yet.</div> : null}
      </div>
    </aside>
  );
}
