export function ParticipantsBar({ participants, typing }) {
  return (
    <aside className="border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {participants.map((participant) => (
          <div key={participant.userId} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              {(participant.displayName || participant.role || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className="font-medium text-slate-700">{participant.displayName}</span>
            {typing[participant.userId] ? <span className="text-xs text-brand">typing</span> : null}
          </div>
        ))}
        {!participants.length ? <span className="text-sm text-slate-500">Waiting for participants...</span> : null}
      </div>
    </aside>
  );
}
