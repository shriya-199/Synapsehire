import { AIAnalyticsPanel } from '../../components/ai/AIAnalyticsPanel';

export function AIAnalyticsPage() {
  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">SynapseHire AI</p>
          <h1 className="mt-2 text-3xl font-semibold">Interview analysis</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review AI-generated hiring signals, recommendation distribution, and recent candidate evaluations.
          </p>
        </div>
        <AIAnalyticsPanel />
      </div>
    </main>
  );
}
