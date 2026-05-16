const Interview = require('../models/Interview');
const InterviewEvent = require('../models/InterviewEvent');
const { getRedis } = require('../config/redis');
const ApiError = require('../utils/ApiError');

const ROOM_TTL_SECONDS = 48 * 60 * 60;
const DEFAULT_CODE = `function twoSum(nums, target) {
  // Write your solution here
}
`;

const canAccessInterview = (user, interview) => {
  const isCandidate = user.role === 'CANDIDATE' && String(interview.candidateId) === user.id;
  const isOrgUser = user.role !== 'CANDIDATE' && String(interview.organizationId) === user.organizationId;
  return user.role === 'ADMIN' || isCandidate || isOrgUser;
};

const getRoomKey = (interviewId) => `interview:${interviewId}:room`;
const getEditorKey = (interviewId) => `interview:${interviewId}:editor`;
const getParticipantsKey = (interviewId) => `interview:${interviewId}:participants`;

const hydrateRoom = async (user, interviewId) => {
  const interview = await Interview.findById(interviewId);

  if (!interview || !canAccessInterview(user, interview)) {
    throw new ApiError(403, 'Interview access denied');
  }

  const redis = getRedis();
  const roomKey = getRoomKey(interviewId);
  const editorKey = getEditorKey(interviewId);

  const existingEditor = await redis.hgetall(editorKey);
  const roomState = await redis.hgetall(roomKey);

  if (!roomState.status) {
    await redis.hmset(roomKey, {
      status: interview.status,
      startedAt: interview.startedAt ? interview.startedAt.toISOString() : '',
      scheduledAt: interview.scheduledAt ? interview.scheduledAt.toISOString() : '',
      durationSeconds: interview.durationSeconds || 3600
    });
    await redis.expire(roomKey, ROOM_TTL_SECONDS);
  }

  if (!existingEditor.version) {
    await redis.hmset(editorKey, {
      code: DEFAULT_CODE,
      language: 'javascript',
      version: 0,
      updatedBy: '',
      updatedAt: new Date().toISOString(),
      savedAt: ''
    });
    await redis.expire(editorKey, ROOM_TTL_SECONDS);
  }

  const editor = await redis.hgetall(editorKey);
  const participants = await redis.hgetall(getParticipantsKey(interviewId));

  return {
    interview,
    state: {
      interviewId,
      status: roomState.status || interview.status,
      startedAt: roomState.startedAt || (interview.startedAt ? interview.startedAt.toISOString() : null),
      scheduledAt: roomState.scheduledAt || (interview.scheduledAt ? interview.scheduledAt.toISOString() : null),
      durationSeconds: Number(roomState.durationSeconds || interview.durationSeconds || 3600),
      editor: {
        code: editor.code || DEFAULT_CODE,
        language: editor.language || 'javascript',
        version: Number(editor.version || 0),
        updatedBy: editor.updatedBy || null,
        updatedAt: editor.updatedAt || null,
        savedAt: editor.savedAt || null
      },
      participants: Object.values(participants).map((item) => JSON.parse(item))
    }
  };
};

const addParticipant = async (interviewId, participant) => {
  const redis = getRedis();
  const key = getParticipantsKey(interviewId);
  await redis.hset(key, participant.userId, JSON.stringify(participant));
  await redis.expire(key, ROOM_TTL_SECONDS);
};

const removeParticipant = async (interviewId, userId) => {
  const redis = getRedis();
  await redis.hdel(getParticipantsKey(interviewId), userId);
};

const saveEditorSnapshot = async ({ interviewId, userId, code, language, version }) => {
  const redis = getRedis();
  const key = getEditorKey(interviewId);
  const current = await redis.hgetall(key);
  const currentVersion = Number(current.version || 0);

  if (version < currentVersion) {
    return {
      accepted: false,
      reason: 'STALE_VERSION',
      current: {
        code: current.code || DEFAULT_CODE,
        language: current.language || 'javascript',
        version: currentVersion
      }
    };
  }

  const nextVersion = version;
  const updatedAt = new Date().toISOString();
  await redis.hmset(key, {
    code,
    language,
    version: nextVersion,
    updatedBy: userId,
    updatedAt
  });
  await redis.expire(key, ROOM_TTL_SECONDS);

  return {
    accepted: true,
    editor: { code, language, version: nextVersion, updatedBy: userId, updatedAt }
  };
};

const markSaved = async ({ interviewId, userId }) => {
  const redis = getRedis();
  const key = getEditorKey(interviewId);
  const savedAt = new Date().toISOString();
  await redis.hset(key, 'savedAt', savedAt);
  await InterviewEvent.create({
    interviewId,
    userId,
    type: 'CODE_CHANGE',
    severity: 'INFO',
    payload: { savedAt }
  });
  return savedAt;
};

module.exports = {
  hydrateRoom,
  addParticipant,
  removeParticipant,
  saveEditorSnapshot,
  markSaved
};
