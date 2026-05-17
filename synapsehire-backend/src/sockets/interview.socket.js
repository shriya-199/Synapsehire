const Joi = require('joi');
const InterviewEvent = require('../models/InterviewEvent');
const logger = require('../utils/logger');
const roomService = require('../services/interviewRoom.service');
const monitoringService = require('../services/monitoring.service');

const objectId = Joi.string().hex().length(24);

const validatePayload = (schema, payload) => {
  const { error, value } = schema.validate(payload, { stripUnknown: true });
  if (error) throw error;
  return value;
};

const registerInterviewSocket = (io, socket) => {
  socket.on('interview:join', async (payload, ack) => {
    try {
      const { interviewId, displayName } = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          displayName: Joi.string().trim().max(120).optional()
        }),
        payload
      );

      const room = `interview:${interviewId}`;
      const recruiterRoom = `interview:${interviewId}:recruiters`;
      const { state } = await roomService.hydrateRoom(socket.user, interviewId);
      socket.join(room);
      if (socket.user.role !== 'CANDIDATE') {
        socket.join(recruiterRoom);
      }
      socket.data.interviewId = interviewId;

      const participant = {
        userId: socket.user.id,
        role: socket.user.role,
        displayName: displayName || socket.user.role,
        socketId: socket.id,
        joinedAt: new Date().toISOString()
      };

      await roomService.addParticipant(interviewId, participant);

      await InterviewEvent.create({
        interviewId,
        userId: socket.user.id,
        type: 'ROOM_JOIN',
        severity: 'INFO',
        payload: { socketId: socket.id }
      });

      socket.emit('interview:state', state);
      socket.to(room).emit('interview:presence', { interviewId, participant, status: 'joined' });

      if (ack) ack({ success: true, state });
    } catch (error) {
      logger.warn('interview:join failed', { error: error.message, userId: socket.user.id });
      if (ack) ack({ success: false, message: error.message });
    }
  });

  socket.on('editor:change', async (payload, ack) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          questionId: objectId.optional(),
          code: Joi.string().allow('').max(200000).required(),
          language: Joi.string().max(40).required(),
          version: Joi.number().integer().min(0).required(),
          operationId: Joi.string().max(80).optional()
        }),
        payload
      );

      const room = `interview:${value.interviewId}`;
      const result = await roomService.saveEditorSnapshot({
        interviewId: value.interviewId,
        userId: socket.user.id,
        code: value.code,
        language: value.language,
        version: value.version
      });

      if (!result.accepted) {
        if (ack) ack({ success: false, reason: result.reason, current: result.current });
        socket.emit('editor:sync-required', result.current);
        return;
      }

      socket.to(room).emit('editor:change', {
        ...value,
        userId: socket.user.id,
        updatedAt: result.editor.updatedAt
      });
      if (ack) ack({ success: true, editor: result.editor });
    } catch {
      socket.emit('error', { message: 'Invalid editor change payload' });
    }
  });

  socket.on('editor:autosave', async (payload, ack) => {
    try {
      const value = validatePayload(Joi.object({ interviewId: objectId.required() }), payload);
      const savedAt = await roomService.markSaved({ interviewId: value.interviewId, userId: socket.user.id });
      io.to(`interview:${value.interviewId}`).emit('editor:saved', {
        interviewId: value.interviewId,
        userId: socket.user.id,
        savedAt
      });
      if (ack) ack({ success: true, savedAt });
    } catch {
      if (ack) ack({ success: false, message: 'Autosave failed' });
    }
  });

  socket.on('editor:cursor', (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          position: Joi.object({
            lineNumber: Joi.number().integer().min(1).required(),
            column: Joi.number().integer().min(1).required()
          }).required(),
          selection: Joi.object({
            startLineNumber: Joi.number().integer().min(1).required(),
            startColumn: Joi.number().integer().min(1).required(),
            endLineNumber: Joi.number().integer().min(1).required(),
            endColumn: Joi.number().integer().min(1).required()
          }).optional()
        }),
        payload
      );

      socket.to(`interview:${value.interviewId}`).emit('editor:cursor', {
        ...value,
        userId: socket.user.id
      });
    } catch {
      socket.emit('error', { message: 'Invalid cursor payload' });
    }
  });

  socket.on('editor:typing', (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          isTyping: Joi.boolean().required()
        }),
        payload
      );

      socket.to(`interview:${value.interviewId}`).emit('editor:typing', {
        interviewId: value.interviewId,
        userId: socket.user.id,
        isTyping: value.isTyping
      });
    } catch {
      socket.emit('error', { message: 'Invalid typing payload' });
    }
  });

  socket.on('editor:language-change', async (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          language: Joi.string().valid('javascript', 'typescript', 'python', 'java', 'cpp').required(),
          code: Joi.string().allow('').max(200000).required(),
          version: Joi.number().integer().min(0).required()
        }),
        payload
      );

      await roomService.saveEditorSnapshot({
        interviewId: value.interviewId,
        userId: socket.user.id,
        code: value.code,
        language: value.language,
        version: value.version
      });

      io.to(`interview:${value.interviewId}`).emit('editor:language-change', {
        ...value,
        userId: socket.user.id
      });
    } catch {
      socket.emit('error', { message: 'Invalid language payload' });
    }
  });

  socket.on('chat:message', async (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          message: Joi.string().trim().min(1).max(2000).required()
        }),
        payload
      );

      await InterviewEvent.create({
        interviewId: value.interviewId,
        userId: socket.user.id,
        type: 'MESSAGE',
        payload: { message: value.message },
        severity: 'INFO'
      });

      io.to(`interview:${value.interviewId}`).emit('chat:message', {
        ...value,
        userId: socket.user.id,
        createdAt: new Date().toISOString()
      });
    } catch {
      socket.emit('error', { message: 'Invalid chat message payload' });
    }
  });

  socket.on('monitoring:event', async (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          type: Joi.string()
            .valid(
              'TAB_SWITCH',
              'COPY_PASTE',
              'FACE_MISSING',
              'MULTIPLE_FACES',
              'SCREEN_SHARE_STOPPED',
              'AUDIO_ACTIVITY',
              'CAMERA_DISABLED',
              'MIC_DISABLED',
              'NETWORK_DROP'
            )
            .required(),
          severity: Joi.string().valid('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
          payload: Joi.object().default({})
        }),
        payload
      );

      const alert = await monitoringService.createAlert({
        interviewId: value.interviewId,
        userId: socket.user.id,
        type: value.type,
        severity: value.severity,
        payload: value.payload
      });

      io.to(`interview:${value.interviewId}:recruiters`).emit('monitoring:flag', {
        interviewId: value.interviewId,
        alert
      });
    } catch {
      socket.emit('error', { message: 'Invalid monitoring payload' });
    }
  });

  socket.on('video:signal', (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          targetUserId: objectId.required(),
          channel: Joi.string().valid('camera', 'screen', 'video').default('video'),
          signalType: Joi.string().valid('offer', 'answer', 'ice-candidate', 'renegotiate').required(),
          signal: Joi.object().required()
        }),
        payload
      );

      io.to(`user:${value.targetUserId}`).emit(`video:${value.signalType}`, {
        interviewId: value.interviewId,
        fromUserId: socket.user.id,
        channel: value.channel,
        signal: value.signal
      });
    } catch {
      socket.emit('error', { message: 'Invalid video signaling payload' });
    }
  });

  socket.on('video:media-state', (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          cameraEnabled: Joi.boolean().required(),
          micEnabled: Joi.boolean().required(),
          screenSharing: Joi.boolean().required()
        }),
        payload
      );

      socket.to(`interview:${value.interviewId}`).emit('video:media-state', {
        ...value,
        userId: socket.user.id,
        updatedAt: new Date().toISOString()
      });
    } catch {
      socket.emit('error', { message: 'Invalid media state payload' });
    }
  });

  socket.on('video:visibility-control', (payload) => {
    try {
      const value = validatePayload(
        Joi.object({
          interviewId: objectId.required(),
          candidateCanViewInterviewer: Joi.boolean().required()
        }),
        payload
      );

      if (socket.user.role === 'CANDIDATE') {
        socket.emit('error', { message: 'Only interviewers can control video visibility' });
        return;
      }

      socket.to(`interview:${value.interviewId}`).emit('video:visibility-control', {
        ...value,
        updatedBy: socket.user.id,
        updatedAt: new Date().toISOString()
      });
    } catch {
      socket.emit('error', { message: 'Invalid visibility control payload' });
    }
  });

  socket.on('disconnect', async () => {
    const interviewId = socket.data.interviewId;
    if (!interviewId) return;

    await roomService.removeParticipant(interviewId, socket.user.id);
    socket.to(`interview:${interviewId}`).emit('interview:presence', {
      interviewId,
      userId: socket.user.id,
      status: 'left'
    });
  });
};

module.exports = registerInterviewSocket;
