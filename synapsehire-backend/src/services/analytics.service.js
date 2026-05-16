const Interview = require('../models/Interview');
const AIEvaluation = require('../models/AIEvaluation');
const MonitoringAlert = require('../models/MonitoringAlert');
const Assessment = require('../models/Assessment');
const ApiError = require('../utils/ApiError');

const parseDate = (value, fallback) => (value ? new Date(value) : fallback);

const getDateRange = (query) => {
  const now = new Date();
  const fallbackFrom = new Date(now);
  fallbackFrom.setDate(now.getDate() - 30);

  return {
    from: parseDate(query.from, fallbackFrom),
    to: parseDate(query.to, now)
  };
};

const getInterviewFilter = (user, query = {}) => {
  const { from, to } = getDateRange(query);
  const filter = {
    createdAt: { $gte: from, $lte: to }
  };

  if (user.role === 'CANDIDATE') {
    filter.candidateId = user._id;
  } else if (user.role !== 'ADMIN') {
    filter.organizationId = user.organizationId;
  }

  if (query.status) filter.status = query.status;
  if (query.assessmentId) filter.assessmentId = query.assessmentId;
  if (query.recruiterId) filter.recruiterId = query.recruiterId;

  return filter;
};

const average = (items, selector) => {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + (Number(selector(item)) || 0), 0) / items.length);
};

const getOverview = async (user, query) => {
  const filter = getInterviewFilter(user, query);
  const interviews = await Interview.find(filter).lean();
  const interviewIds = interviews.map((item) => item._id);
  const evaluations = await AIEvaluation.find({ interviewId: { $in: interviewIds }, status: 'COMPLETED' }).lean();
  const alerts = await MonitoringAlert.find({ interviewId: { $in: interviewIds } }).lean();

  const byStatus = interviews.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const highIntent = evaluations.filter((item) =>
    ['STRONG_HIRE', 'HIRE', 'LEAN_HIRE'].includes(item.recommendation)
  ).length;

  return {
    cards: {
      totalInterviews: interviews.length,
      completedInterviews: byStatus.COMPLETED || 0,
      averageHiringProbability: average(evaluations, (item) => item.scores?.hiringProbability),
      highIntentCandidates: highIntent,
      alerts: alerts.length
    },
    byStatus,
    recommendationCounts: evaluations.reduce((acc, item) => {
      acc[item.recommendation] = (acc[item.recommendation] || 0) + 1;
      return acc;
    }, {})
  };
};

const getFunnel = async (user, query) => {
  const filter = getInterviewFilter(user, query);
  const interviews = await Interview.find(filter).lean();
  const counts = interviews.reduce(
    (acc, item) => {
      acc.invited += 1;
      if (['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(item.status)) acc.scheduled += 1;
      if (['IN_PROGRESS', 'COMPLETED'].includes(item.status)) acc.started += 1;
      if (item.status === 'COMPLETED') acc.completed += 1;
      if ((item.rankingScore || 0) >= 70) acc.shortlisted += 1;
      return acc;
    },
    { invited: 0, scheduled: 0, started: 0, completed: 0, shortlisted: 0 }
  );

  return [
    { stage: 'Invited', value: counts.invited },
    { stage: 'Scheduled', value: counts.scheduled },
    { stage: 'Started', value: counts.started },
    { stage: 'Completed', value: counts.completed },
    { stage: 'Shortlisted', value: counts.shortlisted }
  ];
};

const getPerformance = async (user, query) => {
  const filter = getInterviewFilter(user, query);
  const interviews = await Interview.find(filter).select('_id createdAt').lean();
  const interviewIds = interviews.map((item) => item._id);
  const evaluations = await AIEvaluation.find({ interviewId: { $in: interviewIds }, status: 'COMPLETED' }).lean();

  const byDay = evaluations.reduce((acc, item) => {
    const day = item.createdAt.toISOString().slice(0, 10);
    acc[day] = acc[day] || [];
    acc[day].push(item);
    return acc;
  }, {});

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      hiringProbability: average(items, (item) => item.scores?.hiringProbability),
      technical: average(items, (item) => item.scores?.technicalCorrectness),
      communication: average(items, (item) => item.scores?.communication),
      confidence: average(items, (item) => item.scores?.confidence)
    }));
};

const getSkillHeatmap = async (user, query) => {
  const filter = getInterviewFilter(user, query);
  const interviews = await Interview.find(filter).select('_id').lean();
  const interviewIds = interviews.map((item) => item._id);
  const evaluations = await AIEvaluation.find({ interviewId: { $in: interviewIds }, status: 'COMPLETED' }).lean();

  const skills = new Map();

  evaluations.forEach((evaluation) => {
    const matched = evaluation.technicalKeywords?.matched || [];
    const missing = evaluation.technicalKeywords?.missing || [];
    matched.forEach((skill) => {
      const key = skill.toLowerCase();
      const current = skills.get(key) || { skill, matched: 0, missing: 0 };
      current.matched += 1;
      skills.set(key, current);
    });
    missing.forEach((skill) => {
      const key = skill.toLowerCase();
      const current = skills.get(key) || { skill, matched: 0, missing: 0 };
      current.missing += 1;
      skills.set(key, current);
    });
  });

  return Array.from(skills.values())
    .map((item) => ({
      ...item,
      coverage: Math.round((item.matched / Math.max(1, item.matched + item.missing)) * 100)
    }))
    .sort((a, b) => b.matched + b.missing - (a.matched + a.missing))
    .slice(0, 30);
};

const getReports = async (user, query) => {
  const filter = getInterviewFilter(user, query);
  const interviews = await Interview.find(filter)
    .populate('candidateId', 'name email')
    .populate('assessmentId', 'title role seniority')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  const evaluations = await AIEvaluation.find({ interviewId: { $in: interviews.map((item) => item._id) } }).lean();
  const evaluationByInterview = new Map(evaluations.map((item) => [String(item.interviewId), item]));

  return interviews.map((interview) => {
    const evaluation = evaluationByInterview.get(String(interview._id));
    return {
      interviewId: interview._id,
      candidate: interview.candidateId,
      assessment: interview.assessmentId,
      status: interview.status,
      scheduledAt: interview.scheduledAt,
      finalScore: interview.finalScore,
      recommendation: evaluation?.recommendation,
      hiringProbability: evaluation?.scores?.hiringProbability,
      strengths: evaluation?.strengths || [],
      weaknesses: evaluation?.weaknesses || []
    };
  });
};

const getCandidateDashboard = async (user) => {
  const interviews = await Interview.find({ candidateId: user._id }).sort({ createdAt: -1 }).lean();
  const evaluations = await AIEvaluation.find({ candidateId: user._id, status: 'COMPLETED' }).sort({ createdAt: -1 }).lean();

  return {
    cards: {
      interviews: interviews.length,
      completed: interviews.filter((item) => item.status === 'COMPLETED').length,
      averageScore: average(evaluations, (item) => item.scores?.hiringProbability),
      strongestSignal: evaluations[0]?.strengths?.[0] || null
    },
    performance: evaluations.map((item) => ({
      date: item.createdAt.toISOString().slice(0, 10),
      hiringProbability: item.scores?.hiringProbability || 0,
      technical: item.scores?.technicalCorrectness || 0,
      communication: item.scores?.communication || 0
    })),
    reports: evaluations.slice(0, 10)
  };
};

const getAdminControls = async (user) => {
  if (user.role !== 'ADMIN') throw new ApiError(403, 'Admin access required');

  const [interviews, assessments, evaluations] = await Promise.all([
    Interview.countDocuments(),
    Assessment.countDocuments(),
    AIEvaluation.countDocuments()
  ]);

  return {
    totals: { interviews, assessments, evaluations },
    featureFlags: {
      aiEvaluationEnabled: true,
      videoMonitoringEnabled: true,
      exportsEnabled: true
    }
  };
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const exportReportsCsv = async (user, query) => {
  const reports = await getReports(user, query);
  const rows = [
    ['Candidate', 'Email', 'Assessment', 'Status', 'Score', 'Recommendation', 'Strengths', 'Weaknesses'],
    ...reports.map((report) => [
      report.candidate?.name,
      report.candidate?.email,
      report.assessment?.title,
      report.status,
      report.hiringProbability,
      report.recommendation,
      report.strengths.join('; '),
      report.weaknesses.join('; ')
    ])
  ];

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
};

module.exports = {
  getOverview,
  getFunnel,
  getPerformance,
  getSkillHeatmap,
  getReports,
  getCandidateDashboard,
  getAdminControls,
  exportReportsCsv
};
