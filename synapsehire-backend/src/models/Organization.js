const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE'
    },
    settings: {
      aiEvaluationEnabled: { type: Boolean, default: true },
      videoRecordingEnabled: { type: Boolean, default: false },
      antiCheatEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
