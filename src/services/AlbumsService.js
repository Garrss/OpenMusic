const { nanoid } = require('nanoid');
const db = require('../config/database');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await db.query(query);

    if (!result.rows[0].id) {
      throw new Error('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Album tidak ditemukan');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await db.query(query);
    return result.rows;
  }

  async updateAlbumCover(albumId, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, albumId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Album tidak ditemukan');
    }

    return result.rows[0];
  }

  async getAlbumCover(albumId) {
    const query = {
      text: 'SELECT cover FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Album tidak ditemukan');
    }

    return result.rows[0].cover;
  }
}

module.exports = AlbumsService;
