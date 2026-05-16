const Joi = require('joi');

const runCodeSchema = Joi.object({
  interviewId: Joi.string().hex().length(24).required(),
  language: Joi.string().valid('javascript', 'typescript', 'python', 'java', 'cpp').required(),
  code: Joi.string().allow('').max(200000).required(),
  stdin: Joi.string().allow('').max(20000).default('')
});

module.exports = {
  runCodeSchema
};
