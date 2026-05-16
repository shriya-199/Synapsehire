const mongoose = require('mongoose');

const monitoringAlertSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        'TAB_SWITCH',
        'SCREEN_SHARE_STOPPED',
        'FACE_MISSING',
        'MULTIPLE_FACES',
        'AUDIO_ACTIVITY',
        'CAMERA_DISABLED',
        'MIC_DISABLED',
        'NETWORK_DROP',
        'COPY_PASTE'
      ],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    message: String,
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date
  },
  { timestamps: true }
);

monitoringAlertSchema.index({ interviewId: 1, createdAt: -1 });
monitoringAlertSchema.index({ interviewId: 1, severity: 1 });

module.exports = mongoose.model('MonitoringAlert', monitoringAlertSchema);
