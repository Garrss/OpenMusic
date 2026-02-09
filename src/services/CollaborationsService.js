const { nanoid } = require('nanoid');
const db = require('../config/database');

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    // Cek apakah collaboration sudah ada
    const checkQuery = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const existing = await db.query(checkQuery);
    if (existing.rows.length > 0) {
      throw new Error('Kolaborasi sudah ada');
    }

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await db.query(query);

    if (!result.rows[0].id) {
      throw new Error('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
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

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await db.query(query);
    return result.rows.length > 0;
  }
}

module.exports = CollaborationsService;
