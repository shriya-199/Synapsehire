const weights = {
  technicalCorrectness: 0.22,
  problemSolving: 0.18,
  codeQuality: 0.14,
  communication: 0.14,
  debugging: 0.08,
  efficiency: 0.08,
  confidence: 0.06,
  keywordCoverage: 0.1
};

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const weightedHiringProbability = (scores) => {
  const base = Object.entries(weights).reduce((total, [key, weight]) => total + clamp(scores[key]) * weight, 0);
  return Math.round(clamp(base));
};

const recommendationFromProbability = (score) => {
  if (score >= 85) return 'STRONG_HIRE';
  if (score >= 72) return 'HIRE';
  if (score >= 60) return 'LEAN_HIRE';
  if (score >= 45) return 'LEAN_NO_HIRE';
  return 'NO_HIRE';
};

const keywordCoverage = (expected = [], matched = []) => {
  if (!expected.length) return 0;
  const matchedSet = new Set(matched.map((item) => item.toLowerCase()));
  const hits = expected.filter((item) => matchedSet.has(item.toLowerCase())).length;
  return Math.round((hits / expected.length) * 100);
};

const finalizeInterviewScores = (analysis) => {
  const expected = analysis.technicalKeywords?.expected || [];
  const matched = analysis.technicalKeywords?.matched || [];
  const coverage = analysis.scores.keywordCoverage || keywordCoverage(expected, matched);
  const scores = { ...analysis.scores, keywordCoverage: coverage };
  const hiringProbability = scores.hiringProbability || weightedHiringProbability(scores);

  return {
    ...analysis,
    scores: {
      ...scores,
      hiringProbability
    },
    recommendation: analysis.recommendation || recommendationFromProbability(hiringProbability)
  };
};

module.exports = {
  weightedHiringProbability,
  recommendationFromProbability,
  keywordCoverage,
  finalizeInterviewScores
};
