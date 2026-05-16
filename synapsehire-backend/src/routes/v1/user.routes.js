const express = require('express');
const Joi = require('joi');
const userController = require('../../controllers/user.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const ROLES = require('../../constants/roles');

const router = express.Router();

const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  appliedRole: Joi.string().trim().min(2).max(120).optional(),
  organizationId: Joi.string().hex().length(24).optional()
});

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.post('/me/resume', upload.single('resume'), userController.uploadMyResume);
router.get('/candidates', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), userController.listCandidates);
router.get('/candidates/:id', authorizeRoles(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), userController.getCandidate);
router.get('/candidates/:id/resume', userController.downloadCandidateResume);

module.exports = router;
