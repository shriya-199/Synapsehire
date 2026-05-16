const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const organizationRoutes = require('./organization.routes');
const assessmentRoutes = require('./assessment.routes');
const interviewRoutes = require('./interview.routes');
const codeExecutionRoutes = require('./codeExecution.routes');
const aiRoutes = require('./ai.routes');
const monitoringRoutes = require('./monitoring.routes');
const analyticsRoutes = require('./analytics.routes');
const healthController = require('../../controllers/health.controller');
const { notImplemented } = require('../../controllers/placeholder.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/health', healthController.health);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/interviews', interviewRoutes);
router.use('/code', codeExecutionRoutes);
router.use('/ai', aiRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/analytics', analyticsRoutes);

router.use('/questions', authenticate, notImplemented('Questions'));
router.use('/submissions', authenticate, notImplemented('Submissions'));
router.use('/resumes', authenticate, notImplemented('Resume Parsing'));
router.use('/github', authenticate, notImplemented('GitHub Analysis'));
router.use('/rankings', authenticate, notImplemented('Candidate Rankings'));
router.use('/notifications', authenticate, notImplemented('Notifications'));

module.exports = router;
