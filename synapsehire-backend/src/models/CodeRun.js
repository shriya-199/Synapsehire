const mongoose = require('mongoose');

const codeRunSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp']
    },
    code: {
      type: String,
      required: true
    },
    stdin: String,
    status: {
      type: String,
      enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'REJECTED'],
      default: 'QUEUED',
      index: true
    },
    stdout: String,
    stderr: String,
    runtimeMs: Number,
    memoryMb: Number,
    error: String
  },
  { timestamps: true }
);

codeRunSchema.index({ interviewId: 1, createdAt: -1 });

module.exports = mongoose.model('CodeRun', codeRunSchema);
