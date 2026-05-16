import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { AuthError } from '../../components/auth/AuthError';
import { signupCandidate, signupRecruiter } from '../../features/auth/authSlice';
import { validateSignup } from '../../utils/authValidation';

export function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [role, setRole] = useState('CANDIDATE');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSignup(form);
    if (role === 'RECRUITER' && !form.organizationName.trim()) {
      nextErrors.organizationName = 'Organization name is required.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const action = role === 'RECRUITER' ? signupRecruiter : signupCandidate;
    const payload =
      role === 'RECRUITER'
        ? { ...form, role }
        : { name: form.name, email: form.email, password: form.password, role };
    const result = await dispatch(action(payload));
    if (action.fulfilled.match(result)) navigate('/verify-email-sent');
  };

  return (
    <AuthLayout title="Create account" subtitle="Start as a candidate or invite your team as a recruiter.">
      <AuthError message={error} />
      <div className="mb-5 grid grid-cols-2 rounded-[8px] bg-slate-100 p-1">
        {['CANDIDATE', 'RECRUITER'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRole(item)}
            className={`h-10 rounded-[6px] text-sm font-semibold transition ${
              role === item ? 'bg-white text-ink shadow-sm' : 'text-slate-500'
            }`}
          >
            {item === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Full name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FormField label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {role === 'RECRUITER' ? (
          <FormField
            label="Organization"
            value={form.organizationName}
            error={errors.organizationName}
            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
          />
        ) : null}
        <FormField
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <SubmitButton loading={status === 'loading'}>Create account</SubmitButton>
      </form>
      <GoogleAuthButton role={role} />
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
