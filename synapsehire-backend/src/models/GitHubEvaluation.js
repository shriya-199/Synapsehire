const mongoose = require('mongoose');

const githubEvaluationSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    username: { type: String, required: true, index: true },
    score: { type: Number, min: 0, max: 100 },
    signals: {
      consistency: Number,
      projectComplexity: Number,
      codeQuality: Number,
      documentation: Number,
      testing: Number,
      collaboration: Number
    },
    languages: [String],
    notableRepositories: [String],
    strengths: [String],
    weaknesses: [String],
    summary: String,
    modelMetadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model('GitHubEvaluation', githubEvaluationSchema);
