const express = require('express');
const codeExecutionController = require('../../controllers/codeExecution.controller');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { runCodeSchema } = require('../../validators/codeExecution.validator');

const router = express.Router();

router.use(authenticate);

router.post('/run', validate(runCodeSchema), codeExecutionController.runCode);
router.get('/interviews/:interviewId/runs', codeExecutionController.listRuns);

module.exports = router;
