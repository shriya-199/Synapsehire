const mongoose = require('mongoose');

const aiAnalysisJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ANSWER_ANALYSIS', 'INTERVIEW_ANALYSIS', 'RESUME_JOB_MATCH', 'GITHUB_EVALUATION'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      index: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: String,
    model: String,
    inputHash: String,
    resultRef: {
      model: String,
      id: mongoose.Schema.Types.ObjectId
    },
    error: String,
    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysisJob', aiAnalysisJobSchema);
