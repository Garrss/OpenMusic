const redis = require('redis');

class CacheService {
  constructor() {
    const redisServer = process.env.REDIS_SERVER || 'localhost';

    const redisUrl = redisServer.startsWith('redis://')
      ? redisServer
      : `redis://${redisServer}:6379`;

    this._client = redis.createClient({ url: redisUrl });

    this._client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSeconds = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSeconds,
    });
  }

  async get(key) {
    return this._client.get(key);
  }

  async delete(key) {
    await this._client.del(key);
  }

  async close() {
    await this._client.quit();
  }
}

module.exports = CacheService;
