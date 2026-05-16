const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('./base.controller');
const User = require('../models/User');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/ApiError');

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, 'User profile retrieved');
});

const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name'];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      req.user[key] = req.body[key];
    }
  }

  if (req.user.role === ROLES.CANDIDATE && req.body.appliedRole !== undefined) {
    req.user.candidateProfile = {
      ...req.user.candidateProfile?.toObject?.(),
      appliedRole: req.body.appliedRole
    };
  }

  await req.user.save();
  sendSuccess(res, { user: req.user }, 'User profile updated');
});

const uploadMyResume = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.CANDIDATE) {
    throw new ApiError(403, 'Only candidates can upload resumes');
  }

  if (!req.file) {
    throw new ApiError(400, 'Resume file is required');
  }

  req.user.candidateProfile = {
    ...req.user.candidateProfile?.toObject?.(),
    resume: {
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    }
  };

  await req.user.save();
  sendSuccess(res, { user: req.user }, 'Resume uploaded');
});

const listCandidates = asyncHandler(async (req, res) => {
  const query = {
    role: ROLES.CANDIDATE,
    status: { $in: ['ACTIVE', 'PENDING_EMAIL_VERIFICATION'] }
  };

  if (req.query.appliedRole) {
    query['candidateProfile.appliedRole'] = req.query.appliedRole;
  }

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { 'candidateProfile.appliedRole': { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const candidates = await User.find(query)
    .select('_id name email role status emailVerifiedAt candidateProfile createdAt')
    .sort({ createdAt: -1 })
    .limit(100);

  sendSuccess(res, candidates, 'Candidates retrieved');
});

module.exports = {
  getMe,
  updateMe,
  uploadMyResume,
  listCandidates
};
