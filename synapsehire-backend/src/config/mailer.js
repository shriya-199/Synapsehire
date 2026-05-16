const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

let transporter;

const parseSender = (from) => {
  const match = String(from || '').match(/^(.*)<(.+)>$/);
  if (!match) return { email: from };
  return {
    name: match[1].trim(),
    email: match[2].trim()
  };
};

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

const sendBrevoMail = async ({ to, subject, html, text }) => {
  const sender = parseSender(env.smtp.from);
  logger.info('Sending email through Brevo API', {
    to,
    subject,
    sender: sender.email
  });

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': env.brevo.apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error('Brevo email API failed', { status: response.status, body });
    throw new ApiError(502, 'Email provider rejected the message');
  }

  const payload = await response.json();
  logger.info('Brevo email API accepted message', {
    to,
    subject,
    messageId: payload.messageId
  });
  return payload;
};

const sendMail = async ({ to, subject, html, text }) => {
  if (env.brevo.apiKey) {
    return sendBrevoMail({ to, subject, html, text });
  }

  if (!env.smtp.host) {
    logger.warn('SMTP_HOST is not configured. Email was not sent.', { to, subject });
    throw new ApiError(503, 'Email service is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }

  logger.info('Sending email through SMTP', {
    to,
    subject,
    host: env.smtp.host,
    port: env.smtp.port
  });

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
