export function RunOutput({ result }) {
  return (
    <section className="h-56 border-t border-slate-200 bg-[#101820] p-4 text-sm text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Output</h2>
        {result ? (
          <span className={`rounded-full px-2 py-1 text-xs ${result.passed ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/10'}`}>
            {result.passed === true ? 'PASSED' : result.passed === false ? 'FAILED' : result.status}
          </span>
        ) : null}
      </div>
      <pre className="h-40 overflow-auto whitespace-pre-wrap rounded-[8px] bg-black/30 p-3 text-xs leading-6">
        {result?.testCaseResults?.length
          ? result.testCaseResults
              .map((testCase, index) => {
                const visibility = testCase.hidden ? 'hidden' : 'visible';
                const actual = testCase.hidden ? '(hidden)' : testCase.actualOutput || '(empty)';
                const expected = testCase.hidden ? '(hidden)' : testCase.expectedOutput || '(empty)';
                return `Test ${index + 1} (${visibility}): ${testCase.passed ? 'PASSED' : 'FAILED'}\nInput: ${testCase.input || '(empty)'}\nExpected: ${expected}\nActual: ${actual}${testCase.error ? `\nError: ${testCase.error}` : ''}`;
              })
              .join('\n\n')
          : result ? result.stdout || result.stderr || result.error || 'No output' : 'Run code to see execution output.'}
      </pre>
    </section>
  );
}
