const express = require('express');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { authRateLimiter } = require('../../middleware/security.middleware');
const {
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
} = require('../../validators/auth.validator');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/signup/candidate', authRateLimiter, validate(candidateSignupSchema), authController.candidateSignup);
router.post('/signup/recruiter', authRateLimiter, validate(recruiterSignupSchema), authController.recruiterSignup);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/google', authRateLimiter, validate(googleOAuthSchema), authController.googleOAuth);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify-email', authRateLimiter, validate(emailVerificationSchema), authController.verifyEmail);
router.post(
  '/resend-verification-email',
  authRateLimiter,
  validate(resendVerificationByEmailSchema),
  authController.resendEmailVerificationByEmail
);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.me);
router.post(
  '/resend-verification',
  authenticate,
  authRateLimiter,
  authController.resendEmailVerification
);
router.post('/otp/request', authenticate, authRateLimiter, validate(requestOtpSchema), authController.requestOtp);
router.post('/otp/verify', authenticate, authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.get('/sessions', authenticate, authController.listSessions);
router.delete('/sessions', authenticate, authController.revokeAllSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);

module.exports = router;
