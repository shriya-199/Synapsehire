const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

let transporter;

const getMailer = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    family: env.smtp.family,
    connectionTimeout: env.smtp.connectionTimeoutMs,
    greetingTimeout: env.smtp.greetingTimeoutMs,
    socketTimeout: env.smtp.socketTimeoutMs,
    auth:
      env.smtp.user && env.smtp.pass
        ? {
            user: env.smtp.user,
            pass: env.smtp.pass
          }
        : undefined
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  if (!env.smtp.host) {
    logger.warn('SMTP_HOST is not configured. Email was not sent.', { to, subject });
    throw new ApiError(503, 'Email service is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }

  return getMailer().sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text
  });
};

module.exports = {
  getMailer,
  sendMail
};
