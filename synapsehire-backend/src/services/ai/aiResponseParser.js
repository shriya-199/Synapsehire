const ApiError = require('../../utils/ApiError');

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const parseJson = (value) => {
  if (typeof value === 'object' && value !== null) return value;

  try {
    return JSON.parse(value);
  } catch {
    const match = String(value || '').match(/\{[\s\S]*\}/);
    if (!match) throw new ApiError(502, 'AI provider returned invalid JSON');
    return JSON.parse(match[0]);
  }
};

const normalizeInterviewAnalysis = (raw) => {
  const parsed = parseJson(raw);
  const scores = parsed.scores || {};

  return {
    ...parsed,
    scores: {
      technicalCorrectness: clampScore(scores.technicalCorrectness),
      problemSolving: clampScore(scores.problemSolving),
      codeQuality: clampScore(scores.codeQuality),
      communication: clampScore(scores.communication),
      debugging: clampScore(scores.debugging),
      efficiency: clampScore(scores.efficiency),
      confidence: clampScore(scores.confidence),
      keywordCoverage: clampScore(scores.keywordCoverage),
      hiringProbability: clampScore(scores.hiringProbability)
    },
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    risks: parsed.risks || [],
    evidence: parsed.evidence || []
  };
};

const normalizeResumeMatch = (raw) => {
  const parsed = parseJson(raw);
  return {
    ...parsed,
    score: clampScore(parsed.score),
    seniorityFit: clampScore(parsed.seniorityFit),
    domainFit: clampScore(parsed.domainFit),
    matchedSkills: parsed.matchedSkills || [],
    missingSkills: parsed.missingSkills || [],
    risks: parsed.risks || []
  };
};

const normalizeGithubEvaluation = (raw) => {
  const parsed = parseJson(raw);
  const signals = parsed.signals || {};
  return {
    ...parsed,
    score: clampScore(parsed.score),
    signals: {
      consistency: clampScore(signals.consistency),
      projectComplexity: clampScore(signals.projectComplexity),
      codeQuality: clampScore(signals.codeQuality),
      documentation: clampScore(signals.documentation),
      testing: clampScore(signals.testing),
      collaboration: clampScore(signals.collaboration)
    },
    languages: parsed.languages || [],
    notableRepositories: parsed.notableRepositories || [],
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || []
  };
};

module.exports = {
  normalizeInterviewAnalysis,
  normalizeResumeMatch,
  normalizeGithubEvaluation
};
