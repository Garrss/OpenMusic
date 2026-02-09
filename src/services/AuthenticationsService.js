const db = require('../config/database');

class AuthenticationsService {
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await db.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING token',
      values: [token],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Refresh token tidak ditemukan');
    }
  }
}

module.exports = AuthenticationsService;
