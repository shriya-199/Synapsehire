import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { authApi } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ token: params.get('token'), password });
      setMessage('Password reset successful.');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a new password to restore account access.">
      {message ? <div className="mb-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      <form onSubmit={submit} className="space-y-4">
        <FormField label="New password" type="password" value={password} error={error} onChange={(e) => setPassword(e.target.value)} />
        <SubmitButton loading={loading}>Update password</SubmitButton>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-medium text-brand hover:underline">
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
