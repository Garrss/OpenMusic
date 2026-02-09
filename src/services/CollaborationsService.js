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

      if (!result.rows[0] || !result.rows[0].id) {
        throw new Error('Kolaborasi gagal ditambahkan');
      }

      return result.rows[0].id;
    } catch (error) {
      console.log('Collaboration insert error:', error.message);
      console.log('Error code:', error.code);

      // Handle foreign key violation (user tidak ditemukan)
      if (error.code === '23503') {
        // Foreign key violation - user tidak ditemukan
        throw new Error('User tidak ditemukan');
      }

      // Handle unique violation (collaboration sudah ada)
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

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Anda bukan kolaborator playlist ini');
    }
  }
}

module.exports = CollaborationsService;
