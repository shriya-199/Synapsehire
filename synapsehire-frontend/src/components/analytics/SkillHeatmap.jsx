export function SkillHeatmap({ skills }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Skill heatmap</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {skills.map((item) => (
          <div key={item.skill} className="rounded-[8px] border border-slate-100 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold">{item.skill}</p>
              <span className="text-sm font-semibold text-brand">{item.coverage}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand" style={{ width: `${item.coverage}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {item.matched} matched · {item.missing} missing
            </p>
          </div>
        ))}
        {!skills.length ? <p className="text-sm text-slate-500">No skill signals yet.</p> : null}
      </div>
    </div>
  );
}
