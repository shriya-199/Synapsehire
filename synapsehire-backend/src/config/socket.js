const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');
const logger = require('../utils/logger');
const User = require('../models/User');
const registerSocketHandlers = require('../sockets');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Socket authentication token missing'));
      }

      const payload = jwt.verify(token, env.jwt.accessSecret);
      const user = await User.findById(payload.sub).select('_id role organizationId status');

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('Socket user is not authorized'));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
        organizationId: user.organizationId?.toString()
      };

      return next();
    } catch (error) {
      logger.warn('Socket authentication failed', { error: error.message });
      return next(new Error('Socket authentication failed'));
    }
  });

  registerSocketHandlers(io);
  return io;
};

module.exports = setupSocket;
