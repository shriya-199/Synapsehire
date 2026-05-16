const mongoose = require('mongoose');

const interviewEventSchema = new mongoose.Schema(
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
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'CODE_CHANGE',
        'RUN_CODE',
        'MESSAGE',
        'TAB_SWITCH',
        'COPY_PASTE',
        'FACE_MISSING',
        'NETWORK_DROP',
        'ROOM_JOIN',
        'ROOM_LEAVE'
      ]
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    severity: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH'],
      default: 'INFO'
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

interviewEventSchema.index({ interviewId: 1, createdAt: 1 });
interviewEventSchema.index({ type: 1 });

module.exports = mongoose.model('InterviewEvent', interviewEventSchema);
