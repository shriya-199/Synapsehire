const ApiError = require('../utils/ApiError');
const Assessment = require('../models/Assessment');

const createAssessment = async (user, payload) => {
  if (!user.organizationId) {
    throw new ApiError(400, 'Recruiter must belong to an organization');
  }

  return Assessment.create({
    ...payload,
    organizationId: user.organizationId,
    createdBy: user._id
  });
};

const listAssessments = async (user, query) => {
  const filter = {};

  if (user.role !== 'ADMIN') {
    filter.organizationId = user.organizationId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  return Assessment.find(filter).sort({ createdAt: -1 }).limit(100);
};

const getAssessmentById = async (user, assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);

  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }

  if (user.role !== 'ADMIN' && String(assessment.organizationId) !== String(user.organizationId)) {
    throw new ApiError(403, 'Assessment access denied');
  }

  return assessment;
};

const updateAssessment = async (user, assessmentId, payload) => {
  const assessment = await getAssessmentById(user, assessmentId);

  if (assessment.status === 'ARCHIVED') {
    throw new ApiError(409, 'Archived assessments cannot be modified');
  }

  Object.assign(assessment, payload);
  await assessment.save();
  return assessment;
};

const publishAssessment = async (user, assessmentId) => {
  const assessment = await getAssessmentById(user, assessmentId);

  if (!assessment.questions.length) {
    throw new ApiError(400, 'Assessment must include at least one question before publishing');
  }

  assessment.status = 'PUBLISHED';
  await assessment.save();
  return assessment;
};

module.exports = {
  createAssessment,
  listAssessments,
  getAssessmentById,
  updateAssessment,
  publishAssessment
};
