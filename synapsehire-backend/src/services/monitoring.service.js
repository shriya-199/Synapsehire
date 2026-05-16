const path = require('path');
const fs = require('fs/promises');
const MonitoringAlert = require('../models/MonitoringAlert');
const SessionRecording = require('../models/SessionRecording');
const InterviewEvent = require('../models/InterviewEvent');
const { getInterviewById } = require('./interview.service');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const severityScore = {
  INFO: 5,
  LOW: 20,
  MEDIUM: 45,
  HIGH: 75,
  CRITICAL: 95
};

const defaultSeverityByType = {
  TAB_SWITCH: 'MEDIUM',
  SCREEN_SHARE_STOPPED: 'HIGH',
  FACE_MISSING: 'HIGH',
  MULTIPLE_FACES: 'CRITICAL',
  AUDIO_ACTIVITY: 'LOW',
  CAMERA_DISABLED: 'HIGH',
  MIC_DISABLED: 'MEDIUM',
  NETWORK_DROP: 'MEDIUM',
  COPY_PASTE: 'MEDIUM'
};

const messageByType = {
  TAB_SWITCH: 'Candidate switched away from the interview tab.',
  SCREEN_SHARE_STOPPED: 'Candidate stopped screen sharing.',
  FACE_MISSING: 'No face detected in camera frame.',
  MULTIPLE_FACES: 'Multiple faces detected in camera frame.',
  AUDIO_ACTIVITY: 'Audio activity detected.',
  CAMERA_DISABLED: 'Camera track was disabled.',
  MIC_DISABLED: 'Microphone track was disabled.',
  NETWORK_DROP: 'Candidate network connection dropped.',
  COPY_PASTE: 'Copy or paste activity detected.'
};

const createAlert = async ({ interviewId, userId, type, severity, payload = {} }) => {
  const resolvedSeverity = severity || defaultSeverityByType[type] || 'LOW';
  const alert = await MonitoringAlert.create({
    interviewId,
    userId,
    type,
    severity: resolvedSeverity,
    score: severityScore[resolvedSeverity] || 0,
    message: messageByType[type] || 'Monitoring event detected.',
    payload
  });

  await InterviewEvent.create({
    interviewId,
    userId,
    type,
    severity: resolvedSeverity === 'CRITICAL' ? 'HIGH' : resolvedSeverity,
    payload
  });

  return alert;
};

const listAlerts = async (user, interviewId) => {
  await getInterviewById(user, interviewId);
  return MonitoringAlert.find({ interviewId }).sort({ createdAt: -1 }).limit(200);
};

const acknowledgeAlert = async (user, alertId) => {
  const alert = await MonitoringAlert.findById(alertId);
  if (!alert) throw new ApiError(404, 'Alert not found');
  await getInterviewById(user, alert.interviewId);
  alert.acknowledgedBy = user._id;
  alert.acknowledgedAt = new Date();
  await alert.save();
  return alert;
};

const getDashboard = async (user, interviewId) => {
  await getInterviewById(user, interviewId);
  const alerts = await MonitoringAlert.find({ interviewId }).sort({ createdAt: -1 }).limit(200);
  const countsByType = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});
  const maxRiskScore = alerts.reduce((max, alert) => Math.max(max, alert.score), 0);
  const openCritical = alerts.filter((alert) => alert.severity === 'CRITICAL' && !alert.acknowledgedAt).length;

  return {
    interviewId,
    totalAlerts: alerts.length,
    maxRiskScore,
    openCritical,
    countsByType,
    recentAlerts: alerts.slice(0, 25)
  };
};

const saveRecordingChunk = async ({ user, interviewId, file, chunkIndex }) => {
  await getInterviewById(user, interviewId);

  if (!file?.buffer?.length) {
    throw new ApiError(400, 'Recording chunk is required');
  }

  const baseDir = path.resolve(process.cwd(), env.upload.recordingStoragePath, String(interviewId), String(user._id));
  await fs.mkdir(baseDir, { recursive: true });

  const safeIndex = Number(chunkIndex);
  const filePath = path.join(baseDir, `${String(safeIndex).padStart(8, '0')}.webm`);
  await fs.writeFile(filePath, file.buffer);

  const recording = await SessionRecording.findOneAndUpdate(
    { interviewId, userId: user._id, status: 'RECORDING' },
    {
      $setOnInsert: { startedAt: new Date() },
      $push: {
        chunks: {
          index: safeIndex,
          path: filePath,
          mimeType: file.mimetype,
          sizeBytes: file.size
        }
      },
      $inc: { totalBytes: file.size }
    },
    { new: true, upsert: true }
  );

  return recording;
};

const completeRecording = async (user, interviewId) => {
  await getInterviewById(user, interviewId);
  const recording = await SessionRecording.findOneAndUpdate(
    { interviewId, userId: user._id, status: 'RECORDING' },
    { status: 'COMPLETED', endedAt: new Date() },
    { new: true }
  );
  return recording;
};

const listRecordings = async (user, interviewId) => {
  await getInterviewById(user, interviewId);
  return SessionRecording.find({ interviewId }).sort({ createdAt: -1 });
};

module.exports = {
  createAlert,
  listAlerts,
  acknowledgeAlert,
  getDashboard,
  saveRecordingChunk,
  completeRecording,
  listRecordings
};
