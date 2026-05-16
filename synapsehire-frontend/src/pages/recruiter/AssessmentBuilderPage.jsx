import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { recruiterApi } from '../../features/recruiter/recruiterApi';
import { getApiErrorMessage } from '../../lib/apiClient';
import { hiringRoles } from '../../constants/hiringRoles';

const initialForm = {
  title: '',
  role: '',
  seniority: 'MID',
  durationMinutes: 60,
  description: '',
  questions: [
    {
      title: '',
      prompt: '',
      starterCode: '',
      language: 'javascript',
      testCases: [{ input: '', expectedOutput: '', hidden: false }]
    }
  ]
};

export function AssessmentBuilderPage() {
  const [form, setForm] = useState(initialForm);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    recruiterApi
      .listAssessments()
      .then((response) => setAssessments(response.data.data))
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  };

  useEffect(load, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await recruiterApi.createAssessment({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        questions: form.questions.map((question, index) => ({
          ...question,
          order: index + 1,
          weight: 10,
          testCases: question.testCases.filter((testCase) => testCase.expectedOutput.trim())
        }))
      });
      setForm(initialForm);
      setMessage('Assessment created.');
      load();
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    }
  };

  return (
    <main className="min-h-screen bg-panel p-6 text-ink">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-[8px] border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Recruiter</p>
              <h1 className="text-2xl font-semibold">Create assessment</h1>
            </div>
          </div>

          {error ? <div className="mb-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          {message ? <div className="mb-4 rounded-[8px] bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}

          <form onSubmit={submit} className="space-y-4">
            <input className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm" placeholder="Assessment title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="h-11 w-full rounded-[8px] border border-slate-300 px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
              <option value="">Select hiring role</option>
              {hiringRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select className="h-11 rounded-[8px] border border-slate-300 px-3 text-sm" value={form.seniority} onChange={(e) => setForm({ ...form, seniority: e.target.value })}>
                <option value="INTERN">Intern</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="STAFF">Staff</option>
              </select>
              <input className="h-11 rounded-[8px] border border-slate-300 px-3 text-sm" type="number" min="15" max="300" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
            <textarea className="h-28 w-full resize-none rounded-[8px] border border-slate-300 p-3 text-sm" placeholder="Assessment description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <p className="mb-3 text-sm font-semibold">Coding question</p>
              {form.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="space-y-3">
                  <input className="h-10 w-full rounded-[8px] border border-slate-300 px-3 text-sm" placeholder="Question title" value={question.title} onChange={(e) => {
                    const next = [...form.questions];
                    next[questionIndex] = { ...question, title: e.target.value };
                    setForm({ ...form, questions: next });
                  }} required />
                  <textarea className="h-24 w-full resize-none rounded-[8px] border border-slate-300 p-3 text-sm" placeholder="Problem statement" value={question.prompt} onChange={(e) => {
                    const next = [...form.questions];
                    next[questionIndex] = { ...question, prompt: e.target.value };
                    setForm({ ...form, questions: next });
                  }} required />
                  <textarea className="h-24 w-full resize-none rounded-[8px] border border-slate-300 p-3 font-mono text-xs" placeholder="Starter code" value={question.starterCode} onChange={(e) => {
                    const next = [...form.questions];
                    next[questionIndex] = { ...question, starterCode: e.target.value };
                    setForm({ ...form, questions: next });
                  }} />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Test cases</p>
                    {question.testCases.map((testCase, testIndex) => (
                      <div key={testIndex} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input className="h-10 rounded-[8px] border border-slate-300 px-3 text-sm" placeholder="Input/stdin" value={testCase.input} onChange={(e) => {
                          const next = [...form.questions];
                          const testCases = [...question.testCases];
                          testCases[testIndex] = { ...testCase, input: e.target.value };
                          next[questionIndex] = { ...question, testCases };
                          setForm({ ...form, questions: next });
                        }} />
                        <input className="h-10 rounded-[8px] border border-slate-300 px-3 text-sm" placeholder="Expected output" value={testCase.expectedOutput} onChange={(e) => {
                          const next = [...form.questions];
                          const testCases = [...question.testCases];
                          testCases[testIndex] = { ...testCase, expectedOutput: e.target.value };
                          next[questionIndex] = { ...question, testCases };
                          setForm({ ...form, questions: next });
                        }} required />
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <input type="checkbox" checked={testCase.hidden} onChange={(e) => {
                            const next = [...form.questions];
                            const testCases = [...question.testCases];
                            testCases[testIndex] = { ...testCase, hidden: e.target.checked };
                            next[questionIndex] = { ...question, testCases };
                            setForm({ ...form, questions: next });
                          }} />
                          Hidden
                        </label>
                      </div>
                    ))}
                    <button type="button" className="text-sm font-semibold text-brand" onClick={() => {
                      const next = [...form.questions];
                      next[questionIndex] = { ...question, testCases: [...question.testCases, { input: '', expectedOutput: '', hidden: false }] };
                      setForm({ ...form, questions: next });
                    }}>
                      Add test case
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="h-11 w-full rounded-[8px] bg-ink text-sm font-semibold text-white">Create assessment</button>
          </form>
        </section>

        <section className="rounded-[8px] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="font-semibold">Assessments</h2>
            <Link className="text-sm font-semibold text-brand" to="/recruiter/interviews/new">
              Schedule interview
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {assessments.map((assessment) => (
              <div key={assessment._id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className="text-brand" />
                  <div>
                    <p className="font-semibold">{assessment.title}</p>
                    <p className="text-sm text-slate-500">{assessment.role} - {assessment.seniority} - {assessment.durationMinutes} min - {assessment.questions?.length || 0} question(s)</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{assessment.status}</span>
              </div>
            ))}
            {!assessments.length ? <div className="p-4 text-sm text-slate-500">No assessments yet.</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
