import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, Send } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { authApi } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function VerifyEmailSentPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Enter your email address to resend verification.');
      setLoading(false);
      return;
    }

    try {
      await authApi.resendVerificationByEmail(email.trim());
      setMessage('Verification email sent again. Check your inbox and spam folder.');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Check your email" subtitle="We sent a secure verification link to activate your SynapseHire account.">
      <div className="rounded-[8px] border border-slate-200 bg-panel p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
            <MailCheck size={22} />
          </div>
          <div>
            <p className="font-semibold">Verify your email address</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open the email from SynapseHire and click the verification button. After verification, return to login.
            </p>
          </div>
        </div>
      </div>

      {message ? <div className="mt-4 rounded-[8px] bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="mt-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input
          className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white disabled:opacity-70"
      >
        <Send size={17} />
        {loading ? 'Sending...' : 'Resend verification email'}
      </button>

      <Link to="/login" className="mt-5 inline-block text-sm font-medium text-brand hover:underline">
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
