const Joi = require('joi');

const createInterviewSchema = Joi.object({
  assessmentId: Joi.string().hex().length(24).required(),
  candidateId: Joi.string().hex().length(24).required(),
  interviewerIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  scheduledAt: Joi.date().iso().required()
});

const updateInterviewStatusSchema = Joi.object({
  status: Joi.string().valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED').required()
});

module.exports = {
  createInterviewSchema,
  updateInterviewStatusSchema
};
