const crypto = require('crypto');
const AIEvaluation = require('../../models/AIEvaluation');
const AIAnalysisJob = require('../../models/AIAnalysisJob');
const ResumeJobMatch = require('../../models/ResumeJobMatch');
const GitHubEvaluation = require('../../models/GitHubEvaluation');
const Interview = require('../../models/Interview');
const ApiError = require('../../utils/ApiError');
const provider = require('./aiProvider.service');
const {
  interviewAnalysisSchema,
  resumeMatchSchema,
  githubEvaluationSchema
} = require('./ai.schemas');
const {
  PROMPT_VERSION,
  RUBRIC_VERSION,
  systemPrompt,
  buildInterviewPrompt,
  buildResumeMatchPrompt,
  buildGithubPrompt
} = require('./promptBuilder');
const {
  normalizeInterviewAnalysis,
  normalizeResumeMatch,
  normalizeGithubEvaluation
} = require('./aiResponseParser');
const { finalizeInterviewScores } = require('./scoring.service');

const hashInput = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

const assertInterviewAccess = async (user, interviewId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new ApiError(404, 'Interview not found');

  const isCandidate = user.role === 'CANDIDATE' && String(interview.candidateId) === String(user._id);
  const isOrgUser = user.role !== 'CANDIDATE' && String(interview.organizationId) === String(user.organizationId);

  if (user.role !== 'ADMIN' && !isCandidate && !isOrgUser) {
    throw new ApiError(403, 'Interview access denied');
  }

  return interview;
};

const createJob = async ({ type, user, interview, candidateId, inputHash }) =>
  AIAnalysisJob.create({
    type,
    status: 'PROCESSING',
    organizationId: interview?.organizationId || user.organizationId,
    candidateId: candidateId || interview?.candidateId,
    interviewId: interview?._id,
    requestedBy: user._id,
    inputHash,
    startedAt: new Date()
  });

const completeJob = async (job, resultRef, providerResult) => {
  job.status = 'COMPLETED';
  job.resultRef = resultRef;
  job.provider = providerResult.provider;
  job.model = providerResult.model;
  job.completedAt = new Date();
  await job.save();
};

const failJob = async (job, error) => {
  job.status = 'FAILED';
  job.error = error.message;
  job.completedAt = new Date();
  await job.save();
};

const analyzeInterview = async (user, payload) => {
  const started = Date.now();
  const interview = await assertInterviewAccess(user, payload.interviewId);
  const inputHash = hashInput(payload);
  const job = await createJob({ type: 'INTERVIEW_ANALYSIS', user, interview, inputHash });

  try {
    const providerResult = await provider.generateStructured({
      schemaName: 'interview_analysis',
      schema: interviewAnalysisSchema,
      system: systemPrompt,
      user: buildInterviewPrompt(payload)
    });

    const normalized = finalizeInterviewScores(normalizeInterviewAnalysis(providerResult.text));
    const evaluation = await AIEvaluation.create({
      interviewId: interview._id,
      candidateId: interview.candidateId,
      assessmentId: interview.assessmentId,
      status: 'COMPLETED',
      scores: normalized.scores,
      technicalKeywords: normalized.technicalKeywords,
      evidence: normalized.evidence,
      strengths: normalized.strengths,
      weaknesses: normalized.weaknesses,
      risks: normalized.risks,
      summary: normalized.summary,
      feedback: normalized.feedback,
      recommendation: normalized.recommendation,
      modelMetadata: {
        provider: providerResult.provider,
        model: providerResult.model,
        promptVersion: PROMPT_VERSION,
        rubricVersion: RUBRIC_VERSION,
        latencyMs: Date.now() - started
      },
      rawProviderResponse: providerResult.raw
    });

    interview.finalScore = normalized.scores.hiringProbability;
    interview.rankingScore = normalized.scores.hiringProbability;
    await interview.save();

    await completeJob(job, { model: 'AIEvaluation', id: evaluation._id }, providerResult);
    return { job, evaluation };
  } catch (error) {
    await failJob(job, error);
    throw error;
  }
};

const analyzeAnswer = async (user, payload) =>
  analyzeInterview(user, {
    interviewId: payload.interviewId,
    transcript: payload.answer,
    code: payload.code,
    question: payload.question,
    rubric: payload.rubric,
    expectedKeywords: payload.expectedKeywords
  });

const resumeJobMatch = async (user, payload) => {
  const inputHash = hashInput(payload);
  const job = await createJob({ type: 'RESUME_JOB_MATCH', user, candidateId: payload.candidateId, inputHash });

  try {
    const providerResult = await provider.generateStructured({
      schemaName: 'resume_job_match',
      schema: resumeMatchSchema,
      system: systemPrompt,
      user: buildResumeMatchPrompt(payload)
    });
    const normalized = normalizeResumeMatch(providerResult.text);
    const match = await ResumeJobMatch.create({
      candidateId: payload.candidateId,
      assessmentId: payload.assessmentId,
      organizationId: user.organizationId,
      ...normalized,
      modelMetadata: {
        provider: providerResult.provider,
        model: providerResult.model,
        promptVersion: PROMPT_VERSION
      }
    });
    await completeJob(job, { model: 'ResumeJobMatch', id: match._id }, providerResult);
    return { job, match };
  } catch (error) {
    await failJob(job, error);
    throw error;
  }
};

const evaluateGithub = async (user, payload) => {
  const inputHash = hashInput(payload);
  const job = await createJob({ type: 'GITHUB_EVALUATION', user, candidateId: payload.candidateId, inputHash });

  try {
    const providerResult = await provider.generateStructured({
      schemaName: 'github_evaluation',
      schema: githubEvaluationSchema,
      system: systemPrompt,
      user: buildGithubPrompt(payload)
    });
    const normalized = normalizeGithubEvaluation(providerResult.text);
    const evaluation = await GitHubEvaluation.create({
      candidateId: payload.candidateId,
      username: payload.username,
      ...normalized,
      modelMetadata: {
        provider: providerResult.provider,
        model: providerResult.model,
        promptVersion: PROMPT_VERSION
      }
    });
    await completeJob(job, { model: 'GitHubEvaluation', id: evaluation._id }, providerResult);
    return { job, evaluation };
  } catch (error) {
    await failJob(job, error);
    throw error;
  }
};

const getEvaluation = async (user, evaluationId) => {
  const evaluation = await AIEvaluation.findById(evaluationId);
  if (!evaluation) throw new ApiError(404, 'AI evaluation not found');
  await assertInterviewAccess(user, evaluation.interviewId);
  return evaluation;
};

const getDashboard = async (user) => {
  const filter = {};
  if (user.role !== 'ADMIN') filter.organizationId = user.organizationId;

  const interviews = await Interview.find(filter).select('_id');
  const interviewIds = interviews.map((item) => item._id);
  const evaluations = await AIEvaluation.find({ interviewId: { $in: interviewIds }, status: 'COMPLETED' }).sort({
    createdAt: -1
  });

  const total = evaluations.length || 1;
  const averageHiringProbability = Math.round(
    evaluations.reduce((sum, item) => sum + (item.scores?.hiringProbability || 0), 0) / total
  );

  const recommendationCounts = evaluations.reduce((acc, item) => {
    acc[item.recommendation] = (acc[item.recommendation] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvaluations: evaluations.length,
    averageHiringProbability,
    recommendationCounts,
    recentEvaluations: evaluations.slice(0, 10)
  };
};

module.exports = {
  analyzeInterview,
  analyzeAnswer,
  resumeJobMatch,
  evaluateGithub,
  getEvaluation,
  getDashboard
};
