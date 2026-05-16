const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectMongo, disconnectMongo } = require('./config/database');
const { connectRedis, disconnectRedis } = require('./config/redis');
const setupSocket = require('./config/socket');
const logger = require('./utils/logger');

let server;

const startServer = async () => {
  await connectMongo();
  await connectRedis();

  server = http.createServer(app);
  const io = setupSocket(server);
  app.set('io', io);

  server.listen(env.port, () => {
    logger.info(`SynapseHire API listening on port ${env.port}`, {
      environment: env.nodeEnv,
      apiVersion: env.apiVersion
    });
  });
};

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  if (server) {
    server.close(async () => {
      try {
        await disconnectRedis();
        await disconnectMongo();
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Shutdown failed', { error: error.message });
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer().catch((error) => {
  logger.error('Server startup failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
