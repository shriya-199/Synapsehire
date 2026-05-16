const asyncHandler = require('../utils/asyncHandler');
const monitoringService = require('../services/monitoring.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const listAlerts = asyncHandler(async (req, res) => {
  const alerts = await monitoringService.listAlerts(req.user, req.params.interviewId);
  sendSuccess(res, alerts, 'Monitoring alerts retrieved');
});

const acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await monitoringService.acknowledgeAlert(req.user, req.params.alertId);
  sendSuccess(res, alert, 'Alert acknowledged');
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await monitoringService.getDashboard(req.user, req.params.interviewId);
  sendSuccess(res, dashboard, 'Monitoring dashboard retrieved');
});

const uploadRecordingChunk = asyncHandler(async (req, res) => {
  const recording = await monitoringService.saveRecordingChunk({
    user: req.user,
    interviewId: req.body.interviewId,
    file: req.file,
    chunkIndex: req.body.chunkIndex
  });
  sendCreated(res, recording, 'Recording chunk uploaded');
});

const completeRecording = asyncHandler(async (req, res) => {
  const recording = await monitoringService.completeRecording(req.user, req.body.interviewId);
  sendSuccess(res, recording, 'Recording completed');
});

const listRecordings = asyncHandler(async (req, res) => {
  const recordings = await monitoringService.listRecordings(req.user, req.params.interviewId);
  sendSuccess(res, recordings, 'Recordings retrieved');
});

module.exports = {
  listAlerts,
  acknowledgeAlert,
  getDashboard,
  uploadRecordingChunk,
  completeRecording,
  listRecordings
};
