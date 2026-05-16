import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { authApi } from '../../features/auth/authApi';
import { validateEmail } from '../../utils/authValidation';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    await authApi.forgotPassword(email);
    setMessage('If the email exists, a reset link has been sent.');
    setLoading(false);
  };

  return (
    <AuthLayout title="Reset access" subtitle="Request a secure password reset link for your SynapseHire account.">
      {message ? <div className="mb-4 rounded-[8px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Email" type="email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} />
        <SubmitButton loading={loading}>Send reset link</SubmitButton>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm font-medium text-brand hover:underline">
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
