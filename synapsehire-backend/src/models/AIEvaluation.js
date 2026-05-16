const mongoose = require('mongoose');

const aiEvaluationSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    scores: {
      technicalCorrectness: Number,
      problemSolving: Number,
      codeQuality: Number,
      communication: Number,
      debugging: Number,
      efficiency: Number,
      confidence: Number,
      keywordCoverage: Number,
      resumeMatch: Number,
      githubStrength: Number,
      hiringProbability: Number
    },
    technicalKeywords: {
      expected: [String],
      matched: [String],
      missing: [String]
    },
    evidence: [
      {
        category: String,
        signal: String,
        weight: Number
      }
    ],
    strengths: [String],
    weaknesses: [String],
    risks: [String],
    summary: String,
    feedback: String,
    recommendation: {
      type: String,
      enum: ['STRONG_HIRE', 'HIRE', 'LEAN_HIRE', 'LEAN_NO_HIRE', 'NO_HIRE']
    },
    modelMetadata: {
      provider: String,
      model: String,
      version: String,
      promptVersion: String,
      rubricVersion: String,
      latencyMs: Number
    },
    rawProviderResponse: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

aiEvaluationSchema.index({ assessmentId: 1, candidateId: 1 });
aiEvaluationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AIEvaluation', aiEvaluationSchema);
