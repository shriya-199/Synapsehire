import { Download, Search } from 'lucide-react';

export function DashboardFilters({ filters, onChange, onExport }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_160px_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search candidates or reports"
            className="h-11 w-full rounded-[8px] border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-brand"
          />
        </label>
        <input
          type="date"
          value={filters.from}
          onChange={(event) => onChange({ from: event.target.value })}
          className="h-11 rounded-[8px] border border-slate-300 px-3 text-sm outline-none focus:border-brand"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(event) => onChange({ to: event.target.value })}
          className="h-11 rounded-[8px] border border-slate-300 px-3 text-sm outline-none focus:border-brand"
        />
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className="h-11 rounded-[8px] border border-slate-300 px-3 text-sm outline-none focus:border-brand"
        >
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button
          type="button"
          onClick={onExport}
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white"
        >
          <Download size={17} />
          Export
        </button>
      </div>
    </div>
  );
}
