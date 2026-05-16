import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { recruiterApi } from '../../features/recruiter/recruiterApi';
import { getApiErrorMessage } from '../../lib/apiClient';
import { hiringRoles } from '../../constants/hiringRoles';

export function ScheduleInterviewPage() {
  const [assessments, setAssessments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({
    role: '',
    assessmentId: '',
    candidateId: '',
    scheduledAt: ''
  });
  const [createdInterview, setCreatedInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([recruiterApi.listAssessments(), recruiterApi.listCandidates()])
      .then(([assessmentRes, candidateRes]) => {
        setAssessments(assessmentRes.data.data);
        setCandidates(candidateRes.data.data);
      })
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  }, []);

  const roleAssessments = form.role ? assessments.filter((assessment) => assessment.role === form.role) : assessments;
  const roleCandidates = form.role
    ? candidates.filter((candidate) => candidate.candidateProfile?.appliedRole === form.role)
    : candidates;

  const updateRole = (role) => {
    setForm({
      ...form,
      role,
      assessmentId: '',
      candidateId: ''
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setCreatedInterview(null);
    try {
      const response = await recruiterApi.scheduleInterview({
        assessmentId: form.assessmentId,
        candidateId: form.candidateId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        interviewerIds: []
      });
      setCreatedInterview(response.data.data);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    }
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto max-w-3xl rounded-[8px] border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
            <CalendarPlus size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Recruiter</p>
            <h1 className="text-2xl font-semibold">Schedule interview</h1>
          </div>
        </div>

        {error ? <div className="mb-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <form onSubmit={submit} className="grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Applied role</span>
            <select
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
              value={form.role}
              onChange={(event) => updateRole(event.target.value)}
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

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Assessment</span>
            <select
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
              value={form.assessmentId}
              onChange={(event) => setForm({ ...form, assessmentId: event.target.value })}
              required
            >
              <option value="">Select assessment</option>
              {roleAssessments.map((assessment) => (
                <option key={assessment._id} value={assessment._id}>
                  {assessment.title} - {assessment.role}
                </option>
              ))}
            </select>
            {form.role && !roleAssessments.length ? (
              <p className="mt-2 text-xs text-amber-700">No assessments found for this role. Create an assessment first.</p>
            ) : null}
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Candidate</span>
            <select
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
              value={form.candidateId}
              onChange={(event) => setForm({ ...form, candidateId: event.target.value })}
              required
            >
              <option value="">Select candidate</option>
              {roleCandidates.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.name} - {candidate.email} - {candidate.candidateProfile?.resume ? 'Resume uploaded' : 'No resume'}
                </option>
              ))}
            </select>
            {form.role && !roleCandidates.length ? (
              <p className="mt-2 text-xs text-amber-700">No candidates have selected this role yet.</p>
            ) : null}
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Date and time</span>
            <input
              className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
              required
            />
          </label>

          <button className="h-11 rounded-[8px] bg-ink text-sm font-semibold text-white">Schedule interview</button>
        </form>

        {createdInterview ? (
          <div className="mt-6 rounded-[8px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">Interview scheduled.</p>
            <p className="mt-1 text-sm text-emerald-700">Interview ID: {createdInterview._id}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-white" to={`/interviews/${createdInterview._id}/room`}>
                Open coding room
              </Link>
              <Link className="rounded-[8px] border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800" to="/recruiter/interviews">
                View interviews
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
