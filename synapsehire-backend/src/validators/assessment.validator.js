const Joi = require('joi');

const questionRefSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required(),
  order: Joi.number().integer().min(1).required(),
  weight: Joi.number().min(0).max(100).default(10)
});

const createAssessmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(180).required(),
  description: Joi.string().trim().max(5000).allow('', null),
  role: Joi.string().trim().min(2).max(120).required(),
  seniority: Joi.string().valid('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF').default('MID'),
  durationMinutes: Joi.number().integer().min(15).max(300).default(60),
  questions: Joi.array().items(questionRefSchema).default([]),
  settings: Joi.object({
    allowVideo: Joi.boolean().default(true),
    requireCamera: Joi.boolean().default(false),
    allowCopyPaste: Joi.boolean().default(false),
    antiCheatEnabled: Joi.boolean().default(true),
    aiEvaluationEnabled: Joi.boolean().default(true)
  }).default()
});

const updateAssessmentSchema = createAssessmentSchema.fork(
  ['title', 'role'],
  (schema) => schema.optional()
);

module.exports = {
  createAssessmentSchema,
  updateAssessmentSchema
};
