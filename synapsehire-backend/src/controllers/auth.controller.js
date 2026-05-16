const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/v1/auth'
};

const getRequestMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(env.jwt.refreshCookieName, refreshToken, cookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.jwt.refreshCookieName, cookieOptions);
};

const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendCreated(res, { user: payload.user, accessToken: payload.accessToken }, 'Registration successful');
});

const candidateSignup = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendCreated(res, { user: payload.user, accessToken: payload.accessToken }, 'Candidate account created');
});

const recruiterSignup = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendCreated(res, { user: payload.user, accessToken: payload.accessToken }, 'Recruiter account created');
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendSuccess(res, { user: payload.user, accessToken: payload.accessToken }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies[env.jwt.refreshCookieName];
  const payload = await authService.refresh(token, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendSuccess(res, { user: payload.user, accessToken: payload.accessToken }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies[env.jwt.refreshCookieName];
  await authService.logout(token);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logout successful');
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, 'Authenticated user');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  sendSuccess(res, { user }, 'Email verified');
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  await authService.resendEmailVerification(req.user);
  sendSuccess(res, null, 'Verification email sent');
});

const resendEmailVerificationByEmail = asyncHandler(async (req, res) => {
  await authService.resendEmailVerificationByEmail(req.body);
  sendSuccess(res, null, 'If the account exists and is unverified, a verification email has been sent');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  sendSuccess(res, null, 'If the email exists, a reset link has been sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Password reset successful');
});

const requestOtp = asyncHandler(async (req, res) => {
  await authService.requestOtp(req.user, req.body.purpose);
  sendSuccess(res, null, 'OTP sent');
});

const verifyOtp = asyncHandler(async (req, res) => {
  await authService.verifyOtp(req.user, req.body.otp);
  sendSuccess(res, null, 'OTP verified');
});

const googleOAuth = asyncHandler(async (req, res) => {
  const payload = await authService.googleOAuth(req.body, getRequestMeta(req));
  setRefreshCookie(res, payload.refreshToken);
  sendSuccess(res, { user: payload.user, accessToken: payload.accessToken }, 'Google authentication successful');
});

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.listSessions(req.user._id);
  sendSuccess(res, { sessions }, 'Sessions retrieved');
});

const revokeSession = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.user._id, req.params.sessionId);
  sendSuccess(res, null, 'Session revoked');
});

const revokeAllSessions = asyncHandler(async (req, res) => {
  await authService.revokeAllSessions(req.user._id);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'All sessions revoked');
});

module.exports = {
  register,
  candidateSignup,
  recruiterSignup,
  login,
  refreshToken,
  logout,
  me,
  verifyEmail,
  resendEmailVerification,
  resendEmailVerificationByEmail,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtp,
  googleOAuth,
  listSessions,
  revokeSession,
  revokeAllSessions
};
