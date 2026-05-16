const asyncHandler = require('../utils/asyncHandler');
const interviewService = require('../services/interview.service');
const { sendSuccess, sendCreated } = require('./base.controller');

const createInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.createInterview(req.user, req.body);
  sendCreated(res, interview, 'Interview scheduled');
});

const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewService.listInterviews(req.user);
  sendSuccess(res, interviews, 'Interviews retrieved');
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.getInterviewById(req.user, req.params.id);
  await interview.populate('assessmentId', 'title role seniority durationMinutes questions');
  await interview.populate('candidateId', 'name email candidateProfile');
  sendSuccess(res, interview, 'Interview retrieved');
});

const startInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.startInterview(req.user, req.params.id);
  req.app.get('io')?.to(`interview:${interview._id}`).emit('interview:status', {
    interviewId: interview._id,
    status: interview.status
  });
  sendSuccess(res, interview, 'Interview started');
});

const endInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.endInterview(req.user, req.params.id);
  req.app.get('io')?.to(`interview:${interview._id}`).emit('interview:ended', {
    interviewId: interview._id,
    status: interview.status
  });
  sendSuccess(res, interview, 'Interview ended');
});

module.exports = {
  createInterview,
  listInterviews,
  getInterview,
  startInterview,
  endInterview
};
