const mongoose = require('mongoose');

const recordingChunkSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    path: { type: String, required: true },
    mimeType: String,
    sizeBytes: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const sessionRecordingSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['RECORDING', 'COMPLETED', 'FAILED'],
      default: 'RECORDING',
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: Date,
    chunks: [recordingChunkSchema],
    totalBytes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

sessionRecordingSchema.index({ interviewId: 1, userId: 1 });

module.exports = mongoose.model('SessionRecording', sessionRecordingSchema);
