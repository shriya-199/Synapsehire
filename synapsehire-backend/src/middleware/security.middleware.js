const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const assignRequestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, 'CORS origin denied'));
  },
  credentials: true
});

const apiRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

const applySecurityMiddleware = (app) => {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(assignRequestId);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(apiRateLimiter);
};

module.exports = {
  applySecurityMiddleware,
  authRateLimiter
};
