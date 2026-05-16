const express = require('express');
const interviewController = require('../../controllers/interview.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const ROLES = require('../../constants/roles');
const {
  createInterviewSchema
} = require('../../validators/interview.validator');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(interviewController.listInterviews)
  .post(
    authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
    validate(createInterviewSchema),
    interviewController.createInterview
  );

router.get('/:id', interviewController.getInterview);
router.post('/:id/start', interviewController.startInterview);
router.post(
  '/:id/end',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER),
  interviewController.endInterview
);

module.exports = router;
