export function InterviewReportsTable({ reports, search }) {
  const filtered = reports.filter((report) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [report.candidate?.name, report.candidate?.email, report.assessment?.title, report.recommendation]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <h2 className="font-semibold">Interview reports</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((report) => (
              <tr key={report.interviewId}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{report.candidate?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{report.candidate?.email}</p>
                </td>
                <td className="px-4 py-3">{report.assessment?.title || 'Assessment'}</td>
                <td className="px-4 py-3">{report.status}</td>
                <td className="px-4 py-3 font-semibold text-brand">{report.hiringProbability ?? '-'}</td>
                <td className="px-4 py-3">{report.recommendation || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <div className="p-4 text-sm text-slate-500">No reports match the current filters.</div> : null}
      </div>
    </div>
  );
}
