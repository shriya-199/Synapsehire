import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-panel p-6 text-ink">
      <div className="max-w-md rounded-[8px] bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your current role does not have access to this area.</p>
        <Link to="/dashboard" className="mt-5 inline-flex h-10 items-center rounded-[8px] bg-ink px-4 text-sm font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
