const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    interviewerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
      default: 'SCHEDULED',
      index: true
    },
    scheduledAt: Date,
    startedAt: Date,
    endedAt: Date,
    durationSeconds: Number,
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    videoRecordingUrl: String,
    finalScore: Number,
    rankingScore: Number,
    flags: [
      {
        type: String,
        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

interviewSchema.index({ organizationId: 1, status: 1 });
interviewSchema.index({ candidateId: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
