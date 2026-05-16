const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const analyzeInterviewSchema = Joi.object({
  interviewId: objectId.required(),
  transcript: Joi.string().allow('').max(100000).required(),
  code: Joi.string().allow('').max(200000).default(''),
  question: Joi.string().allow('').max(10000).default(''),
  expectedKeywords: Joi.array().items(Joi.string().trim().max(80)).default([]),
  rubric: Joi.object().default({})
});

const analyzeAnswerSchema = Joi.object({
  interviewId: objectId.required(),
  answer: Joi.string().allow('').max(100000).required(),
  code: Joi.string().allow('').max(200000).default(''),
  question: Joi.string().allow('').max(10000).default(''),
  expectedKeywords: Joi.array().items(Joi.string().trim().max(80)).default([]),
  rubric: Joi.object().default({})
});

const resumeMatchSchema = Joi.object({
  candidateId: objectId.required(),
  assessmentId: objectId.optional(),
  resumeText: Joi.string().allow('').max(120000).required(),
  jobDescription: Joi.string().allow('').max(60000).required(),
  requiredSkills: Joi.array().items(Joi.string().trim().max(80)).default([])
});

const githubEvaluationSchema = Joi.object({
  candidateId: objectId.required(),
  username: Joi.string().trim().min(1).max(80).required(),
  profileSummary: Joi.string().allow('').max(30000).default(''),
  repositories: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow('', null),
        language: Joi.string().allow('', null),
        stars: Joi.number().integer().min(0).default(0),
        forks: Joi.number().integer().min(0).default(0),
        topics: Joi.array().items(Joi.string()).default([]),
        hasTests: Joi.boolean().default(false),
        updatedAt: Joi.date().iso().optional()
      })
    )
    .max(50)
    .default([])
});

module.exports = {
  analyzeInterviewSchema,
  analyzeAnswerSchema,
  resumeMatchSchema,
  githubEvaluationSchema
};
