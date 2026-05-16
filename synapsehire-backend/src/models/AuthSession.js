const mongoose = require('mongoose');

const authSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userAgent: String,
    ipAddress: String,
    revokedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    lastUsedAt: Date
  },
  { timestamps: true }
);

authSessionSchema.index({ userId: 1, revokedAt: 1 });

module.exports = mongoose.model('AuthSession', authSessionSchema);
