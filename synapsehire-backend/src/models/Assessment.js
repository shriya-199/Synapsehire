const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    seniority: {
      type: String,
      enum: ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF'],
      default: 'MID'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true
    },
    durationMinutes: {
      type: Number,
      min: 15,
      max: 300,
      default: 60
    },
    questions: [
      {
        title: { type: String, required: true, trim: true, maxlength: 180 },
        prompt: { type: String, required: true, trim: true, maxlength: 5000 },
        starterCode: { type: String, default: '' },
        language: {
          type: String,
          enum: ['javascript', 'typescript', 'python', 'java', 'cpp'],
          default: 'javascript'
        },
        testCases: [
          {
            input: { type: String, default: '' },
            expectedOutput: { type: String, required: true },
            hidden: { type: Boolean, default: false }
          }
        ],
        order: { type: Number, required: true },
        weight: { type: Number, min: 0, max: 100, default: 10 }
      }
    ],
    settings: {
      allowVideo: { type: Boolean, default: true },
      requireCamera: { type: Boolean, default: false },
      allowCopyPaste: { type: Boolean, default: false },
      antiCheatEnabled: { type: Boolean, default: true },
      aiEvaluationEnabled: { type: Boolean, default: true }
    },
    invitedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

assessmentSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
