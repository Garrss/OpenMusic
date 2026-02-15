const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({ url: process.env.REDIS_SERVER });
    this._client.on('error', (err) =>
      console.error('Redis client error:', err),
    );
    this._client.connect();
  }

  async set(key, value, expirationInSeconds = 1800) {
    await this._client.set(key, value, { EX: expirationInSeconds });
  }

  async get(key) {
    return await this._client.get(key);
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;
