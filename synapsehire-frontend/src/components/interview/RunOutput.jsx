export function RunOutput({ result }) {
  return (
    <section className="h-56 border-t border-slate-200 bg-[#101820] p-4 text-sm text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Output</h2>
        {result ? <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{result.status}</span> : null}
      </div>
      <pre className="h-40 overflow-auto whitespace-pre-wrap rounded-[8px] bg-black/30 p-3 text-xs leading-6">
        {result ? result.stdout || result.stderr || result.error || 'No output' : 'Run code to see execution output.'}
      </pre>
    </section>
  );
}
