const asyncHandler = require('../utils/asyncHandler');
const codeExecutionService = require('../services/codeExecution.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const runCode = asyncHandler(async (req, res) => {
  const result = await codeExecutionService.runCode(req.user, req.body);
  req.app.get('io')?.to(`interview:${req.body.interviewId}`).emit('code:run-result', {
    interviewId: req.body.interviewId,
    run: result
  });
  sendCreated(res, result, 'Code run created');
});

const listRuns = asyncHandler(async (req, res) => {
  const runs = await codeExecutionService.listRuns(req.user, req.params.interviewId);
  sendSuccess(res, runs, 'Code runs retrieved');
});

module.exports = {
  runCode,
  listRuns
};
