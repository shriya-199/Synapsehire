import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileUp, UserRoundCheck } from 'lucide-react';
import { candidateApi } from '../../features/candidate/candidateApi';
import { loadMe } from '../../features/auth/authSlice';
import { getApiErrorMessage } from '../../lib/apiClient';
import { hiringRoles } from '../../constants/hiringRoles';

export function CandidateProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [appliedRole, setAppliedRole] = useState(user?.candidateProfile?.appliedRole || '');
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const savedResume = user?.candidateProfile?.resume;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      await candidateApi.updateProfile({ appliedRole });
      if (resume) {
        await candidateApi.uploadResume(resume);
      }
      await dispatch(loadMe()).unwrap();
      setResume(null);
      setStatus('Candidate profile updated.');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    }
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-3xl rounded-[8px] border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
            <UserRoundCheck size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Candidate</p>
            <h1 className="text-2xl font-semibold">Application profile</h1>
            <p className="mt-1 text-sm text-slate-600">Select your applied role and upload your latest resume.</p>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {status ? <div className="mb-4 rounded-[8px] bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div> : null}

        <form onSubmit={submit} className="grid gap-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Role applied for</span>
            <select
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
              value={appliedRole}
              onChange={(event) => setAppliedRole(event.target.value)}
              required
            >
              <option value="">Select role</option>
              {hiringRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-5">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileUp size={18} />
              Upload resume
            </span>
            <input
              className="mt-4 block w-full text-sm text-slate-700 file:mr-4 file:rounded-[8px] file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setResume(event.target.files?.[0] || null)}
            />
            <p className="mt-3 text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX.</p>
          </label>

          {savedResume ? (
            <div className="rounded-[8px] border border-slate-200 p-4 text-sm">
              <p className="font-semibold text-slate-800">Current resume</p>
              <p className="mt-1 text-slate-600">
                {savedResume.fileName} - {Math.ceil((savedResume.size || 0) / 1024)} KB
              </p>
            </div>
          ) : null}

          <button className="h-11 rounded-[8px] bg-ink text-sm font-semibold text-white">Save profile</button>
        </form>
      </div>
    </main>
  );
}
