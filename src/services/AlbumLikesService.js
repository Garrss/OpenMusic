const { nanoid } = require('nanoid');
const db = require('../config/database');

class AlbumLikesService {
  constructor(cacheService) {
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    try {
      const result = await db.query(query);

      // Hapus cache karena data berubah
      await this._cacheService.delete(`likes:${albumId}`);

      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('Anda sudah menyukai album ini');
      }
      if (error.code === '23503') {
        // Foreign key violation
        throw new Error('Album tidak ditemukan');
      }
      throw error;
    }
  }

  async deleteLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Anda belum menyukai album ini');
    }

    // Hapus cache karena data berubah
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikesCount(albumId) {
    // Coba ambil dari cache dulu
    try {
      const cachedLikes = await this._cacheService.get(`likes:${albumId}`);
      if (cachedLikes) {
        return {
          count: parseInt(cachedLikes),
          fromCache: true,
        };
      }
    } catch (error) {
      console.error('Cache error:', error.message);
    }

    // Jika tidak ada di cache, ambil dari database
    const query = {
      text: 'SELECT COUNT(*) as count FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await db.query(query);
    const count = parseInt(result.rows[0].count);

    // Simpan ke cache untuk 30 menit
    await this._cacheService.set(`likes:${albumId}`, count, 1800); // 1800 detik = 30 menit

    return {
      count,
      fromCache: false,
    };
  }
}

module.exports = AlbumLikesService;
