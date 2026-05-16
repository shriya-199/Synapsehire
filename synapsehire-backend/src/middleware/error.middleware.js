const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const normalizeError = (error) => {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    return new ApiError(400, 'Validation failed', error.errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, 'Invalid resource identifier');
  }

  if (error.code === 11000) {
    return new ApiError(409, 'Duplicate resource conflict', error.keyValue);
  }

  if (error.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid authentication token');
  }

  if (error.name === 'TokenExpiredError') {
    return new ApiError(401, 'Authentication token expired');
  }

  return new ApiError(500, 'Internal server error');
};

const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);

  logger.error(normalized.message, {
    statusCode: normalized.statusCode,
    method: req.method,
    path: req.originalUrl,
    requestId: req.id,
    details: normalized.details,
    stack: normalized.stack
  });

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    details: env.isProduction ? undefined : normalized.details,
    requestId: req.id
  });
};

module.exports = {
  notFound,
  errorHandler
};
