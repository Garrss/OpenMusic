const { Pool } = require('pg');

class Database {
  constructor() {
    this._pool = new Pool();
  }

  async query(query, values) {
    const client = await this._pool.connect();
    try {
      const result = await client.query(query, values);
      return result;
    } finally {
      client.release();
    }
  }
}

module.exports = new Database();
