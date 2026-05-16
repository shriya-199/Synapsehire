export function FormField({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="h-12 w-full rounded-[8px] border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/12"
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
