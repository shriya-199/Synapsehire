const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('./base.controller');

const overview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user, req.query);
  sendSuccess(res, data, 'Analytics overview retrieved');
});

const funnel = asyncHandler(async (req, res) => {
  const data = await analyticsService.getFunnel(req.user, req.query);
  sendSuccess(res, data, 'Hiring funnel retrieved');
});

const performance = asyncHandler(async (req, res) => {
  const data = await analyticsService.getPerformance(req.user, req.query);
  sendSuccess(res, data, 'Performance analytics retrieved');
});

const skillHeatmap = asyncHandler(async (req, res) => {
  const data = await analyticsService.getSkillHeatmap(req.user, req.query);
  sendSuccess(res, data, 'Skill heatmap retrieved');
});

const reports = asyncHandler(async (req, res) => {
  const data = await analyticsService.getReports(req.user, req.query);
  sendSuccess(res, data, 'Interview reports retrieved');
});

const candidateDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCandidateDashboard(req.user);
  sendSuccess(res, data, 'Candidate dashboard retrieved');
});

const adminControls = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminControls(req.user);
  sendSuccess(res, data, 'Admin controls retrieved');
});

const exportReports = asyncHandler(async (req, res) => {
  const csv = await analyticsService.exportReportsCsv(req.user, req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="synapsehire-interview-reports.csv"');
  res.status(200).send(csv);
});

module.exports = {
  overview,
  funnel,
  performance,
  skillHeatmap,
  reports,
  candidateDashboard,
  adminControls,
  exportReports
};
