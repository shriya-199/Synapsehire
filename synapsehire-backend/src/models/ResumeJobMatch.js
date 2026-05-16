const mongoose = require('mongoose');

const resumeJobMatchSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    score: { type: Number, min: 0, max: 100 },
    matchedSkills: [String],
    missingSkills: [String],
    seniorityFit: { type: Number, min: 0, max: 100 },
    domainFit: { type: Number, min: 0, max: 100 },
    summary: String,
    risks: [String],
    modelMetadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeJobMatch', resumeJobMatchSchema);
