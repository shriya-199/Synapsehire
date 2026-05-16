const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/overview', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.overview);
router.get('/funnel', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.funnel);
router.get('/performance', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.performance);
router.get('/skills', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.skillHeatmap);
router.get('/reports', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.reports);
router.get('/export/reports.csv', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), analyticsController.exportReports);
router.get('/candidate', authorizeRoles(ROLES.CANDIDATE), analyticsController.candidateDashboard);
router.get('/admin', authorizeRoles(ROLES.ADMIN), analyticsController.adminControls);

module.exports = router;
