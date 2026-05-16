const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGODB_URI', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 5000),
  apiVersion: process.env.API_VERSION || 'v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  emailVerificationUrl: process.env.EMAIL_VERIFICATION_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email`,
  passwordResetUrl: process.env.PASSWORD_RESET_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`,
  corsOrigins: parseList(process.env.CORS_ORIGINS || process.env.CLIENT_URL),
  mongo: {
    uri: process.env.MONGODB_URI,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 20)
  },
  redis: {
    url: process.env.REDIS_URL,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'synapsehire:'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'synapsehire_refresh',
    issuer: process.env.JWT_ISSUER || 'synapsehire-api',
    audience: process.env.JWT_AUDIENCE || 'synapsehire-web'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20)
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    family: Number(process.env.SMTP_FAMILY || 4),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'SynapseHire <no-reply@synapsehire.com>',
    connectionTimeoutMs: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeoutMs: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeoutMs: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000)
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY
  },
  upload: {
    maxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 10),
    resumeStoragePath: process.env.RESUME_STORAGE_PATH || 'uploads/resumes',
    recordingMaxChunkMb: Number(process.env.RECORDING_MAX_CHUNK_MB || 25),
    recordingStoragePath: process.env.RECORDING_STORAGE_PATH || 'uploads/recordings'
  },
  authTokens: {
    emailVerificationTtlMinutes: Number(process.env.EMAIL_VERIFICATION_TTL_MINUTES || 30),
    passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 15),
    otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 10)
  },
  codeRunner: {
    url: process.env.CODE_RUNNER_URL,
    timeoutMs: Number(process.env.CODE_RUNNER_TIMEOUT_MS || 10000)
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
    maxRetries: Number(process.env.AI_MAX_RETRIES || 2),
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    }
  }
};

module.exports = env;
