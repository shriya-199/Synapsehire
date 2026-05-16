const express = require('express');
const assessmentController = require('../../controllers/assessment.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const ROLES = require('../../constants/roles');
const {
  createAssessmentSchema,
  updateAssessmentSchema
} = require('../../validators/assessment.validator');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), assessmentController.listAssessments)
  .post(
    authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
    validate(createAssessmentSchema),
    assessmentController.createAssessment
  );

router
  .route('/:id')
  .get(authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), assessmentController.getAssessment)
  .patch(
    authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
    validate(updateAssessmentSchema),
    assessmentController.updateAssessment
  );

router.post(
  '/:id/publish',
  authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER),
  assessmentController.publishAssessment
);

module.exports = router;
