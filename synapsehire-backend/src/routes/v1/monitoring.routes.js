const express = require('express');
const Joi = require('joi');
const monitoringController = require('../../controllers/monitoring.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const { recordingUpload } = require('../../middleware/upload.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

const completeRecordingSchema = Joi.object({
  interviewId: Joi.string().hex().length(24).required()
});

router.use(authenticate);

router.get(
  '/interviews/:interviewId/dashboard',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  monitoringController.getDashboard
);
router.get(
  '/interviews/:interviewId/alerts',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  monitoringController.listAlerts
);
router.patch(
  '/alerts/:alertId/acknowledge',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  monitoringController.acknowledgeAlert
);
router.post('/recordings/chunks', recordingUpload.single('chunk'), monitoringController.uploadRecordingChunk);
router.post('/recordings/complete', validate(completeRecordingSchema), monitoringController.completeRecording);
router.get(
  '/interviews/:interviewId/recordings',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  monitoringController.listRecordings
);

module.exports = router;
