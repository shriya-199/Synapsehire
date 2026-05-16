const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token is required');
  }

  const token = header.slice('Bearer '.length);
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub).select('-passwordHash');

  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'User is not authorized');
  }

  req.user = user;
  next();
});

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource'));
  }

  return next();
};

const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user?.emailVerifiedAt) {
    return next(new ApiError(403, 'Email verification required'));
  }

  return next();
};

const requireSameOrganization = (getOrganizationId) => (req, _res, next) => {
  const targetOrganizationId = String(getOrganizationId(req) || '');
  const userOrganizationId = String(req.user?.organizationId || '');

  if (req.user?.role === 'ADMIN') {
    return next();
  }

  if (!targetOrganizationId || targetOrganizationId !== userOrganizationId) {
    return next(new ApiError(403, 'Organization access denied'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  requireVerifiedEmail,
  requireSameOrganization
};
