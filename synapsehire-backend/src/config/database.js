const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectMongo = async () => {
  try {
    await mongoose.connect(env.mongo.uri, {
      maxPoolSize: env.mongo.maxPoolSize,
      serverSelectionTimeoutMS: 10000
    });

    logger.info('MongoDB connected', {
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    throw error;
  }
};

const disconnectMongo = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB runtime error', { error: error.message });
});

module.exports = {
  connectMongo,
  disconnectMongo
};
