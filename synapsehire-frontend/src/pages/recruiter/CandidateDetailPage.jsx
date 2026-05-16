import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react';
import { recruiterApi } from '../../features/recruiter/recruiterApi';
import { getApiErrorMessage } from '../../lib/apiClient';

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    recruiterApi
      .getCandidate(candidateId)
      .then((response) => setCandidate(response.data.data))
      .catch((apiError) => setError(getApiErrorMessage(apiError)));
  }, [candidateId]);

  const profile = candidate?.candidateProfile || {};
  const resume = profile.resume;
  const signals = profile.resumeSignals || {};

  const downloadResume = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await recruiterApi.downloadCandidateResume(candidateId);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = resume?.fileName || 'candidate-resume';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7f6] p-6 text-ink">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {error ? <div className="mb-4 rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <section className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Candidate profile</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{candidate?.name || 'Candidate'}</h1>
              <p className="mt-2 text-sm text-slate-600">{candidate?.email}</p>
              <p className="mt-1 text-sm text-slate-600">
                {candidate?.organizationId?.name || 'No company'} - {profile.appliedRole || 'Role not selected'}
              </p>
            </div>
            <div className="rounded-[10px] bg-ink px-6 py-4 text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">ATS score</p>
              <p className="mt-2 text-5xl font-semibold">{profile.atsScore || 0}%</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <FileText className="text-brand" />
              <h2 className="font-semibold">Resume</h2>
            </div>
            {resume ? (
              <>
                <p className="mt-4 text-sm font-semibold">{resume.fileName}</p>
                <p className="mt-1 text-sm text-slate-500">{Math.ceil((resume.size || 0) / 1024)} KB - {resume.mimeType}</p>
                <button
                  type="button"
                  onClick={downloadResume}
                  disabled={downloading}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-[8px] bg-ink px-4 text-sm font-semibold text-white disabled:opacity-70"
                >
                  <Download size={17} />
                  {downloading ? 'Downloading...' : 'Download resume'}
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Resume has not been uploaded.</p>
            )}
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-brand" />
              <h2 className="font-semibold">Resume intelligence summary</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {signals.summary || 'No parsed resume summary yet. Ask the candidate to upload a resume.'}
            </p>
            <div className="mt-5">
              <p className="text-sm font-semibold">Detected skillset</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.techStack || []).length ? (
                  profile.techStack.map((tech) => (
                    <span key={tech} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">{tech}</span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No tech stack detected.</span>
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Matched ATS keywords</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(signals.matchedKeywords || []).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{keyword}</span>
                  ))}
                  {!signals.matchedKeywords?.length ? <span className="text-sm text-slate-500">No matches yet.</span> : null}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-700">Missing role keywords</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(signals.missingKeywords || []).slice(0, 10).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{keyword}</span>
                  ))}
                  {!signals.missingKeywords?.length ? <span className="text-sm text-slate-500">No missing keywords.</span> : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
