const registerInterviewSocket = require('./interview.socket');
const logger = require('../utils/logger');

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info('Socket connected', {
      socketId: socket.id,
      userId: socket.user.id
    });

    socket.join(`user:${socket.user.id}`);

    if (socket.user.organizationId) {
      socket.join(`organization:${socket.user.organizationId}`);
    }

    registerInterviewSocket(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', {
        socketId: socket.id,
        userId: socket.user.id,
        reason
      });
    });
  });
};

module.exports = registerSocketHandlers;
