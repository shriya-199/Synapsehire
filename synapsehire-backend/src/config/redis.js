const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient;

const createMemoryRedisClient = () => {
  const strings = new Map();
  const hashes = new Map();
  const sets = new Map();

  const client = {
    status: 'ready',
    async connect() {
      this.status = 'ready';
    },
    async quit() {
      this.status = 'end';
    },
    async set(key, value) {
      strings.set(key, String(value));
      return 'OK';
    },
    async get(key) {
      return strings.get(key) || null;
    },
    async del(key) {
      strings.delete(key);
      hashes.delete(key);
      sets.delete(key);
      return 1;
    },
    async hmset(key, value) {
      const current = hashes.get(key) || {};
      hashes.set(key, { ...current, ...value });
      return 'OK';
    },
    async hgetall(key) {
      return hashes.get(key) || {};
    },
    async hset(key, field, value) {
      const current = hashes.get(key) || {};
      current[field] = value;
      hashes.set(key, current);
      return 1;
    },
    async hdel(key, field) {
      const current = hashes.get(key) || {};
      delete current[field];
      hashes.set(key, current);
      return 1;
    },
    async sadd(key, value) {
      const current = sets.get(key) || new Set();
      current.add(value);
      sets.set(key, current);
      return 1;
    },
    async expire() {
      return 1;
    },
    on() {
      return this;
    }
  };

  logger.warn('Using in-memory Redis adapter. This is for local development only.');
  return client;
};

const createRedisClient = () => {
  if (env.redis.url.startsWith('memory://')) {
    return createMemoryRedisClient();
  }

  const client = new Redis(env.redis.url, {
    keyPrefix: env.redis.keyPrefix,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
  });

  client.on('connect', () => logger.info('Redis connecting'));
  client.on('ready', () => logger.info('Redis ready'));
  client.on('error', (error) => logger.error('Redis error', { error: error.message }));
  client.on('close', () => logger.warn('Redis connection closed'));

  return client;
};

const connectRedis = async () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (redisClient.status === 'wait') {
    await redisClient.connect();
  }

  return redisClient;
};

const getRedis = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected');
  }
};

module.exports = {
  connectRedis,
  getRedis,
  disconnectRedis
};
