const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL',
      index: true
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.CANDIDATE,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING_EMAIL_VERIFICATION', 'ACTIVE', 'INVITED', 'SUSPENDED'],
      default: 'PENDING_EMAIL_VERIFICATION',
      index: true
    },
    emailVerifiedAt: Date,
    otpVerifiedAt: Date,
    lastLoginAt: Date,
    candidateProfile: {
      appliedRole: {
        type: String,
        trim: true,
        maxlength: 120,
        index: true
      },
      resume: {
        fileName: { type: String, trim: true },
        storageName: { type: String, trim: true },
        path: { type: String, trim: true },
        mimeType: { type: String, trim: true },
        size: Number,
        uploadedAt: Date
      },
      atsScore: { type: Number, min: 0, max: 100, default: 0, index: true },
      techStack: [{ type: String, trim: true }],
      resumeParsedAt: Date,
      resumeSignals: {
        matchedKeywords: [{ type: String, trim: true }],
        missingKeywords: [{ type: String, trim: true }],
        summary: { type: String, trim: true, maxlength: 500 }
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ organizationId: 1, role: 1, 'candidateProfile.atsScore': -1 });

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptSaltRounds);
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
