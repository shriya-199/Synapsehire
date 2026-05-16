import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { authApi } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMessage('Verification token is missing.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setMessage('Email verified. You can now sign in.'))
      .catch((error) => setMessage(getApiErrorMessage(error)));
  }, [params]);

  return (
    <AuthLayout title="Email verification" subtitle="SynapseHire verifies email ownership before enabling full access.">
      <div className="rounded-[8px] border border-slate-200 bg-panel p-5 text-sm text-slate-700">{message}</div>
      <Link to="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-semibold text-white">
        Continue to sign in
      </Link>
    </AuthLayout>
  );
}
