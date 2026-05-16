const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('./base.controller');
const env = require('../config/env');
const User = require('../models/User');
const Organization = require('../models/Organization');
const ROLES = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const { parseResume } = require('../services/resumeParser.service');

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

  if (req.user.role === ROLES.CANDIDATE && req.body.organizationId !== undefined) {
    const organization = await Organization.findById(req.body.organizationId);
    if (!organization) {
      throw new ApiError(404, 'Company not found');
    }
    req.user.organizationId = organization._id;
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

  const parsedResume = parseResume({
    file: req.file,
    appliedRole: req.user.candidateProfile?.appliedRole,
    organizationId: req.user.organizationId
  });
  const extension = path.extname(req.file.originalname || '') || '.bin';
  const storageName = `${req.user._id}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
  const storageDir = path.resolve(process.cwd(), env.upload.resumeStoragePath, String(req.user._id));
  await fs.mkdir(storageDir, { recursive: true });
  const storagePath = path.join(storageDir, storageName);
  await fs.writeFile(storagePath, req.file.buffer);

  req.user.candidateProfile = {
    ...req.user.candidateProfile?.toObject?.(),
    resume: {
      fileName: req.file.originalname,
      storageName,
      path: storagePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    },
    ...parsedResume
  };

  await req.user.save();
  sendSuccess(res, { user: req.user }, 'Resume uploaded');
});

const getCandidate = asyncHandler(async (req, res) => {
  const candidate = await User.findOne({ _id: req.params.id, role: ROLES.CANDIDATE })
    .populate('organizationId', 'name domain')
    .select('_id name email role organizationId status emailVerifiedAt candidateProfile createdAt');

  if (!candidate) {
    throw new ApiError(404, 'Candidate not found');
  }

  if (req.user.role !== ROLES.ADMIN && String(candidate.organizationId?._id || candidate.organizationId) !== String(req.user.organizationId)) {
    throw new ApiError(403, 'Candidate is outside your company');
  }

  sendSuccess(res, candidate, 'Candidate retrieved');
});

const downloadCandidateResume = asyncHandler(async (req, res) => {
  const candidate = await User.findOne({ _id: req.params.id, role: ROLES.CANDIDATE }).select('_id organizationId candidateProfile');

  if (!candidate) {
    throw new ApiError(404, 'Candidate not found');
  }

  const isCandidateOwner = req.user.role === ROLES.CANDIDATE && String(candidate._id) === String(req.user._id);
  const isSameCompany = req.user.role !== ROLES.CANDIDATE && String(candidate.organizationId) === String(req.user.organizationId);

  if (req.user.role !== ROLES.ADMIN && !isCandidateOwner && !isSameCompany) {
    throw new ApiError(403, 'Resume access denied');
  }

  const resume = candidate.candidateProfile?.resume;
  if (!resume?.path) {
    throw new ApiError(404, 'Resume not found');
  }

  await fs.access(resume.path);
  res.download(resume.path, resume.fileName);
});

const listCandidates = asyncHandler(async (req, res) => {
  const query = {
    role: ROLES.CANDIDATE,
    status: { $in: ['ACTIVE', 'PENDING_EMAIL_VERIFICATION'] }
  };

  if (req.user.role !== ROLES.ADMIN) {
    if (!req.user.organizationId) {
      sendSuccess(res, [], 'Candidates retrieved');
      return;
    }
    query.organizationId = req.user.organizationId;
  }

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
    .populate('organizationId', 'name domain')
    .select('_id name email role organizationId status emailVerifiedAt candidateProfile createdAt')
    .sort({ 'candidateProfile.atsScore': -1, createdAt: -1 })
    .limit(100);

  sendSuccess(res, candidates, 'Candidates retrieved');
});

module.exports = {
  getMe,
  updateMe,
  uploadMyResume,
  getCandidate,
  downloadCandidateResume,
  listCandidates
};
