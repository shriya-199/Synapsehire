const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AuthSession = require('../models/AuthSession');
const AuthToken = require('../models/AuthToken');
const env = require('../config/env');
const { getRedis } = require('../config/redis');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const emailService = require('./email.service');
const logger = require('../utils/logger');

const refreshTtlSeconds = 30 * 24 * 60 * 60;
const googleClient = new OAuth2Client(env.google.clientId);

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const addMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

const createRandomToken = () => crypto.randomBytes(32).toString('hex');

const createOtp = () => String(crypto.randomInt(100000, 999999));

const storeRefreshToken = async (userId, tokenId, reqMeta = {}) => {
  const redis = getRedis();
  await redis.set(`refresh:${userId}:${tokenId}`, 'valid', 'EX', refreshTtlSeconds);

  await AuthSession.create({
    userId,
    tokenId,
    userAgent: reqMeta.userAgent,
    ipAddress: reqMeta.ipAddress,
    expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    lastUsedAt: new Date()
  });
};

const revokeRefreshToken = async (userId, tokenId) => {
  const redis = getRedis();
  await redis.del(`refresh:${userId}:${tokenId}`);
  await AuthSession.findOneAndUpdate({ userId, tokenId }, { revokedAt: new Date() });
};

const buildAuthPayload = async (user, reqMeta = {}) => {
  const accessToken = signAccessToken(user);
  const refresh = signRefreshToken(user);
  await storeRefreshToken(user._id.toString(), refresh.tokenId, reqMeta);

  return {
    user,
    accessToken,
    refreshToken: refresh.token
  };
};

const createAuthToken = async (userId, type, rawToken, expiresAt, metadata = {}) => {
  await AuthToken.create({
    userId,
    type,
    tokenHash: sha256(rawToken),
    expiresAt,
    metadata
  });
};

const sendEmailVerification = async (user) => {
  const token = createRandomToken();
  await createAuthToken(
    user._id,
    'EMAIL_VERIFICATION',
    token,
    addMinutes(env.authTokens.emailVerificationTtlMinutes)
  );
  return emailService.sendVerificationEmail({ to: user.email, name: user.name, token });
};

const queueEmailVerification = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    logger.error('Verification email failed', {
      userId: user._id.toString(),
      email: user.email,
      error: error.message
    });
  }
};

const register = async ({ name, email, password, role, organizationId, organizationName }, reqMeta = {}) => {
  const existing = await User.findOne({ email });

  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  let resolvedOrganizationId = organizationId;
  if (role === 'RECRUITER' && !resolvedOrganizationId && organizationName) {
    const organization = await Organization.create({ name: organizationName });
    resolvedOrganizationId = organization._id;
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    organizationId: resolvedOrganizationId,
    authProvider: 'LOCAL',
    status: 'PENDING_EMAIL_VERIFICATION'
  });

  queueEmailVerification(user);
  return buildAuthPayload(user, reqMeta);
};

const login = async ({ email, password }, reqMeta = {}) => {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.emailVerifiedAt) {
    throw new ApiError(403, 'Email verification is required before login');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'User account is not active');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthPayload(user, reqMeta);
};

const refresh = async (refreshToken, reqMeta = {}) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const redis = getRedis();
  const redisKey = `refresh:${payload.sub}:${payload.tokenId}`;
  const exists = await redis.get(redisKey);
  const session = await AuthSession.findOne({ userId: payload.sub, tokenId: payload.tokenId });

  if (!exists || !session || session.revokedAt) {
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  const user = await User.findById(payload.sub);

  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'User is not authorized');
  }

  await revokeRefreshToken(payload.sub, payload.tokenId);
  return buildAuthPayload(user, reqMeta);
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const payload = verifyRefreshToken(refreshToken);
  await revokeRefreshToken(payload.sub, payload.tokenId);
};

const verifyEmail = async (token) => {
  const authToken = await AuthToken.findOne({
    tokenHash: sha256(token),
    type: 'EMAIL_VERIFICATION',
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!authToken) {
    throw new ApiError(400, 'Email verification token is invalid or expired');
  }

  const user = await User.findById(authToken.userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.emailVerifiedAt = new Date();
  user.status = 'ACTIVE';
  await user.save();

  authToken.consumedAt = new Date();
  await authToken.save();

  return user;
};

const resendEmailVerification = async (user) => {
  if (user.emailVerifiedAt) {
    throw new ApiError(409, 'Email is already verified');
  }

  await sendEmailVerification(user);
};

const resendEmailVerificationByEmail = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  if (user.emailVerifiedAt) {
    return;
  }

  await sendEmailVerification(user);
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const token = createRandomToken();
  await createAuthToken(user._id, 'PASSWORD_RESET', token, addMinutes(env.authTokens.passwordResetTtlMinutes));
  await emailService.sendPasswordResetEmail({ to: user.email, name: user.name, token });
};

const resetPassword = async ({ token, password }) => {
  const authToken = await AuthToken.findOne({
    tokenHash: sha256(token),
    type: 'PASSWORD_RESET',
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!authToken) {
    throw new ApiError(400, 'Password reset token is invalid or expired');
  }

  const user = await User.findById(authToken.userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  user.passwordHash = await User.hashPassword(password);
  user.authProvider = 'LOCAL';
  await user.save();

  authToken.consumedAt = new Date();
  await authToken.save();

  await revokeAllSessions(user._id);
};

const requestOtp = async (user, purpose = 'LOGIN') => {
  const otp = createOtp();
  await createAuthToken(user._id, 'OTP', otp, addMinutes(env.authTokens.otpTtlMinutes), { purpose });
  await emailService.sendOtpEmail({ to: user.email, name: user.name, otp });
};

const verifyOtp = async (user, otp) => {
  const authToken = await AuthToken.findOne({
    userId: user._id,
    tokenHash: sha256(otp),
    type: 'OTP',
    consumedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!authToken) {
    throw new ApiError(400, 'OTP is invalid or expired');
  }

  authToken.consumedAt = new Date();
  await authToken.save();

  user.otpVerifiedAt = new Date();
  await user.save();
};

const googleOAuth = async ({ credential, role, organizationId }, reqMeta = {}) => {
  if (!env.google.clientId) {
    throw new ApiError(500, 'Google OAuth is not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.google.clientId
  });

  const profile = ticket.getPayload();
  if (!profile?.email_verified) {
    throw new ApiError(403, 'Google email is not verified');
  }

  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      name: profile.name || profile.email,
      email: profile.email,
      role,
      organizationId,
      authProvider: 'GOOGLE',
      googleId: profile.sub,
      emailVerifiedAt: new Date(),
      status: 'ACTIVE'
    });
  } else {
    user.googleId = user.googleId || profile.sub;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    if (user.status === 'PENDING_EMAIL_VERIFICATION') user.status = 'ACTIVE';
    await user.save();
  }

  user.lastLoginAt = new Date();
  await user.save();
  return buildAuthPayload(user, reqMeta);
};

const listSessions = async (userId) =>
  AuthSession.find({ userId, revokedAt: null }).sort({ lastUsedAt: -1 }).select('-__v');

const revokeSession = async (userId, sessionId) => {
  const session = await AuthSession.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, 'Session not found');
  await revokeRefreshToken(userId, session.tokenId);
};

const revokeAllSessions = async (userId) => {
  const sessions = await AuthSession.find({ userId, revokedAt: null });
  await Promise.all(sessions.map((session) => revokeRefreshToken(userId, session.tokenId)));
};

module.exports = {
  register,
  login,
  refresh,
  logout,
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
