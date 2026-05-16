const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const Interview = require('../models/Interview');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

const createInterview = async (user, payload) => {
  const assessment = await Assessment.findById(payload.assessmentId);

  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }

  if (user.role !== 'ADMIN' && String(assessment.organizationId) !== String(user.organizationId)) {
    throw new ApiError(403, 'Assessment access denied');
  }

  const candidate = await User.findById(payload.candidateId);
  if (!candidate || candidate.role !== 'CANDIDATE') {
    throw new ApiError(404, 'Candidate not found');
  }

  const appliedRole = candidate.candidateProfile?.appliedRole;
  if (appliedRole && appliedRole !== assessment.role) {
    throw new ApiError(400, `Candidate applied for ${appliedRole}, but this assessment is for ${assessment.role}`);
  }

  return Interview.create({
    assessmentId: assessment._id,
    organizationId: assessment.organizationId,
    candidateId: payload.candidateId,
    recruiterId: user._id,
    interviewerIds: payload.interviewerIds,
    scheduledAt: payload.scheduledAt,
    roomId: crypto.randomUUID()
  });
};

const listInterviews = async (user) => {
  const filter = {};

  if (user.role === 'CANDIDATE') {
    filter.candidateId = user._id;
  } else if (user.role !== 'ADMIN') {
    filter.organizationId = user.organizationId;
  }

  return Interview.find(filter).sort({ scheduledAt: -1 }).limit(100);
};

const getInterviewById = async (user, interviewId) => {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    throw new ApiError(404, 'Interview not found');
  }

  const isCandidate = user.role === 'CANDIDATE' && String(interview.candidateId) === String(user._id);
  const isOrgMember = user.role !== 'CANDIDATE' && String(interview.organizationId) === String(user.organizationId);

  if (user.role !== 'ADMIN' && !isCandidate && !isOrgMember) {
    throw new ApiError(403, 'Interview access denied');
  }

  return interview;
};

const startInterview = async (user, interviewId) => {
  const interview = await getInterviewById(user, interviewId);

  if (interview.status !== 'SCHEDULED') {
    throw new ApiError(409, 'Only scheduled interviews can be started');
  }

  interview.status = 'IN_PROGRESS';
  interview.startedAt = new Date();
  await interview.save();

  const redis = getRedis();
  await redis.hmset(`interview:${interview._id}:state`, {
    status: interview.status,
    startedAt: interview.startedAt.toISOString(),
    roomId: interview.roomId
  });
  await redis.expire(`interview:${interview._id}:state`, 48 * 60 * 60);

  return interview;
};

const endInterview = async (user, interviewId) => {
  const interview = await getInterviewById(user, interviewId);

  if (interview.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Only active interviews can be ended');
  }

  interview.status = 'COMPLETED';
  interview.endedAt = new Date();
  interview.durationSeconds = Math.floor((interview.endedAt - interview.startedAt) / 1000);
  await interview.save();

  const redis = getRedis();
  await redis.hmset(`interview:${interview._id}:state`, {
    status: interview.status,
    endedAt: interview.endedAt.toISOString()
  });

  return interview;
};

module.exports = {
  createInterview,
  listInterviews,
  getInterviewById,
  startInterview,
  endInterview
};
