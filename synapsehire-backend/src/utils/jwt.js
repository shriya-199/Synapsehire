const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      organizationId: user.organizationId?.toString()
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience
    }
  );

const signRefreshToken = (user, tokenId = crypto.randomUUID()) => ({
  tokenId,
  token: jwt.sign({ sub: user._id.toString(), tokenId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  })
});

const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwt.accessSecret, {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  });

const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwt.refreshSecret, {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
  });

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
