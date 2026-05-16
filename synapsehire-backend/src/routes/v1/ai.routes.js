const express = require('express');
const aiController = require('../../controllers/ai.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const ROLES = require('../../constants/roles');
const {
  analyzeInterviewSchema,
  analyzeAnswerSchema,
  resumeMatchSchema,
  githubEvaluationSchema
} = require('../../validators/ai.validator');

const router = express.Router();

router.use(authenticate);

router.post(
  '/interviews/analyze',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  validate(analyzeInterviewSchema),
  aiController.analyzeInterview
);

router.post(
  '/answers/analyze',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  validate(analyzeAnswerSchema),
  aiController.analyzeAnswer
);

router.post(
  '/resume-job-match',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
  validate(resumeMatchSchema),
  aiController.resumeJobMatch
);

router.post(
  '/github/evaluate',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
  validate(githubEvaluationSchema),
  aiController.evaluateGithub
);

router.get('/evaluations/:id', aiController.getEvaluation);
router.get('/dashboard', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER), aiController.getDashboard);

module.exports = router;
