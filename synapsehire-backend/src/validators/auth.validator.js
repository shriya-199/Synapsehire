const Joi = require('joi');
const ROLES = require('../constants/roles');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid(ROLES.RECRUITER, ROLES.CANDIDATE, ROLES.INTERVIEWER).default(ROLES.CANDIDATE),
  organizationId: Joi.string().hex().length(24).optional()
});

const candidateSignupSchema = registerSchema.keys({
  role: Joi.string().valid(ROLES.CANDIDATE).default(ROLES.CANDIDATE),
  organizationId: Joi.forbidden()
});

const recruiterSignupSchema = registerSchema.keys({
  role: Joi.string().valid(ROLES.RECRUITER).default(ROLES.RECRUITER),
  organizationName: Joi.string().trim().min(2).max(160).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

const googleOAuthSchema = Joi.object({
  credential: Joi.string().required(),
  role: Joi.string().valid(ROLES.CANDIDATE, ROLES.RECRUITER).default(ROLES.CANDIDATE),
  organizationId: Joi.string().hex().length(24).optional()
});

const emailVerificationSchema = Joi.object({
  token: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

const resendVerificationByEmailSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required()
});

const requestOtpSchema = Joi.object({
  purpose: Joi.string().valid('LOGIN', 'EMAIL_VERIFICATION').default('LOGIN')
});

const verifyOtpSchema = Joi.object({
  otp: Joi.string().pattern(/^[0-9]{6}$/).required()
});

module.exports = {
  registerSchema,
  candidateSignupSchema,
  recruiterSignupSchema,
  loginSchema,
  googleOAuthSchema,
  emailVerificationSchema,
  resendVerificationByEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestOtpSchema,
  verifyOtpSchema
};
