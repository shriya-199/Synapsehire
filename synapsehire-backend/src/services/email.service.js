const { sendMail } = require('../config/mailer');
const env = require('../config/env');

const sendVerificationEmail = async ({ to, name, token }) => {
  const verificationUrl = `${env.emailVerificationUrl}?token=${encodeURIComponent(token)}`;

  return sendMail({
    to,
    subject: 'Verify your SynapseHire email',
    text: `Hi ${name}, verify your SynapseHire account with this link: ${verificationUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
        <h2>Verify your SynapseHire email</h2>
        <p>Hi ${name},</p>
        <p>Confirm your email address to activate your SynapseHire account.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#172033;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600">
            Verify email
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">This link expires soon. If you did not create this account, you can ignore this email.</p>
        <p style="font-size:13px;color:#64748b">${verificationUrl}</p>
      </div>
    `
  });
};

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${env.passwordResetUrl}?token=${encodeURIComponent(token)}`;

  return sendMail({
    to,
    subject: 'Reset your SynapseHire password',
    text: `Hi ${name}, reset your password with this link: ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
        <h2>Reset your SynapseHire password</h2>
        <p>Hi ${name},</p>
        <p>Use the secure button below to reset your password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#172033;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600">
            Reset password
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">If you did not request this, ignore this email.</p>
        <p style="font-size:13px;color:#64748b">${resetUrl}</p>
      </div>
    `
  });
};

const sendOtpEmail = async ({ to, name, otp }) =>
  sendMail({
    to,
    subject: 'Your SynapseHire verification code',
    text: `Hi ${name}, your SynapseHire verification code is ${otp}.`,
    html: `<p>Hi ${name},</p><p>Your SynapseHire verification code is:</p><h2>${otp}</h2>`
  });

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOtpEmail
};
