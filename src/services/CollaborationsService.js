const { nanoid } = require('nanoid');
const db = require('../config/database');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    try {
      const result = await db.query(query);

      if (!result.rows[0]?.id) {
        throw new Error('Kolaborasi gagal ditambahkan');
      }

      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('User tidak ditemukan');
      }
      if (error.code === '23505') {
        throw new Error('Kolaborasi sudah ada');
      }
      throw error;
    }
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Kolaborasi tidak ditemukan');
    }
  }
}

module.exports = CollaborationsService;
