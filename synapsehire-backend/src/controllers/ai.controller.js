const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/ai/aiAnalysis.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const analyzeInterview = asyncHandler(async (req, res) => {
  const result = await aiService.analyzeInterview(req.user, req.body);
  sendCreated(res, result, 'Interview analysis completed');
});

const analyzeAnswer = asyncHandler(async (req, res) => {
  const result = await aiService.analyzeAnswer(req.user, req.body);
  sendCreated(res, result, 'Answer analysis completed');
});

const resumeJobMatch = asyncHandler(async (req, res) => {
  const result = await aiService.resumeJobMatch(req.user, req.body);
  sendCreated(res, result, 'Resume-job match completed');
});

const evaluateGithub = asyncHandler(async (req, res) => {
  const result = await aiService.evaluateGithub(req.user, req.body);
  sendCreated(res, result, 'GitHub evaluation completed');
});

const getEvaluation = asyncHandler(async (req, res) => {
  const evaluation = await aiService.getEvaluation(req.user, req.params.id);
  sendSuccess(res, evaluation, 'AI evaluation retrieved');
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await aiService.getDashboard(req.user);
  sendSuccess(res, dashboard, 'AI analytics retrieved');
});

module.exports = {
  analyzeInterview,
  analyzeAnswer,
  resumeJobMatch,
  evaluateGithub,
  getEvaluation,
  getDashboard
};
