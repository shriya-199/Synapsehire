const asyncHandler = require('../utils/asyncHandler');
const assessmentService = require('../services/assessment.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.createAssessment(req.user, req.body);
  sendCreated(res, assessment, 'Assessment created');
});

const listAssessments = asyncHandler(async (req, res) => {
  const assessments = await assessmentService.listAssessments(req.user, req.query);
  sendSuccess(res, assessments, 'Assessments retrieved');
});

const getAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getAssessmentById(req.user, req.params.id);
  sendSuccess(res, assessment, 'Assessment retrieved');
});

const updateAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.updateAssessment(req.user, req.params.id, req.body);
  sendSuccess(res, assessment, 'Assessment updated');
});

const publishAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.publishAssessment(req.user, req.params.id);
  sendSuccess(res, assessment, 'Assessment published');
});

module.exports = {
  createAssessment,
  listAssessments,
  getAssessment,
  updateAssessment,
  publishAssessment
};
