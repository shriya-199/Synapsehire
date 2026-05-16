const winston = require('winston');
const env = require('../config/env');

const redact = winston.format((info) => {
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'authorization'];

  for (const key of sensitiveKeys) {
    if (Object.prototype.hasOwnProperty.call(info, key)) {
      info[key] = '[REDACTED]';
    }
  }

  return info;
});

const logger = winston.createLogger({
  level: env.logLevel,
  defaultMeta: {
    service: 'synapsehire-api',
    environment: env.nodeEnv
  },
  format: winston.format.combine(
    redact(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isProduction ? winston.format.json() : winston.format.prettyPrint()
  ),
  transports: [new winston.transports.Console()]
});

module.exports = logger;
