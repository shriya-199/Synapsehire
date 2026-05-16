import { useState } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { authApi } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function OtpPage() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setError('');
    await authApi.requestOtp('LOGIN');
    setMessage('OTP sent to your verified email.');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) {
      setError('Enter the 6 digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp(otp);
      setMessage('OTP verified.');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="OTP verification" subtitle="Use a short-lived verification code for sensitive account actions.">
      {message ? <div className="mb-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      <button
        type="button"
        onClick={requestOtp}
        className="mb-4 h-11 rounded-[8px] border border-slate-300 px-4 text-sm font-semibold text-ink hover:bg-slate-50"
      >
        Send OTP
      </button>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Verification code" value={otp} error={error} maxLength={6} onChange={(e) => setOtp(e.target.value)} />
        <SubmitButton loading={loading}>Verify OTP</SubmitButton>
      </form>
    </AuthLayout>
  );
}
