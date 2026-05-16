import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { AuthError } from '../../components/auth/AuthError';
import { login } from '../../features/auth/authSlice';
import { authApi } from '../../features/auth/authApi';
import { getApiErrorMessage } from '../../lib/apiClient';
import { validateLogin } from '../../utils/authValidation';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const from = location.state?.from?.pathname || '/dashboard';

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate(from, { replace: true });
  };

  const resendVerification = async () => {
    setVerificationMessage('');
    setVerificationError('');
    if (!form.email.trim()) {
      setVerificationError('Enter your email address first.');
      return;
    }

    try {
      await authApi.resendVerificationByEmail(form.email.trim());
      setVerificationMessage('Verification email sent. Check your inbox and spam folder.');
    } catch (apiError) {
      setVerificationError(getApiErrorMessage(apiError));
    }
  };

  const needsVerification = error?.toLowerCase().includes('email verification');

  return (
    <AuthLayout title="Sign in" subtitle="Access candidate interviews, recruiter dashboards, and evaluation workflows.">
      <AuthError message={error} />
      {needsVerification ? (
        <div className="mb-4 rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Email verification required</p>
          <p className="mt-1">Verify your email before signing in. You can resend the verification email below.</p>
          <button
            type="button"
            onClick={resendVerification}
            className="mt-3 rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Resend verification email
          </button>
          {verificationMessage ? <p className="mt-3 text-emerald-700">{verificationMessage}</p> : null}
          {verificationError ? <p className="mt-3 text-red-700">{verificationError}</p> : null}
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <FormField
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-brand hover:underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Create account
          </Link>
        </div>
        <SubmitButton loading={status === 'loading'}>Sign in</SubmitButton>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleAuthButton role="CANDIDATE" />
    </AuthLayout>
  );
}
