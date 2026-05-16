const mongoose = require('mongoose');
const { getRedis } = require('../config/redis');

const health = async (_req, res) => {
  const redis = getRedis();
  const redisHealthy = redis.status === 'ready';

  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongo: mongoose.connection.readyState === 1 ? 'ready' : 'unavailable',
      redis: redisHealthy ? 'ready' : redis.status
    }
  });
};

module.exports = {
  health
};
