const { nanoid } = require('nanoid');
const db = require('../config/database');
const AlbumsService = require('./AlbumsService');

class SongsService {
  constructor() {
    this._albumsService = new AlbumsService();
  }
  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    if (albumId) {
      await this._albumsService.getAlbumById(albumId);
    }

    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await db.query(query);

    if (!result.rows[0].id) {
      throw new Error('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title = '', performer = '') {
    let queryText = 'SELECT id, title, performer FROM songs WHERE 1=1';
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      queryText += ` AND title ILIKE $${values.length}`;
    }

    if (performer) {
      values.push(`%${performer}%`);
      queryText += ` AND performer ILIKE $${values.length}`;
    }

    const result = await db.query({
      text: queryText,
      values,
    });

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, payload) {
    const existingSong = await this.getSongById(id);

    const albumId =
      payload.albumId !== undefined ? payload.albumId : existingSong.album_id;

    if (albumId) {
      await this._albumsService.getAlbumById(albumId);
    }

    const query = {
      text: `UPDATE songs
      SET title = $1,
          year = $2,
          genre = $3,
          performer = $4,
          duration = $5,
          album_id = $6
      WHERE id = $7
      RETURNING id`,
      values: [
        payload.title ?? existingSong.title,
        payload.year ?? existingSong.year,
        payload.genre ?? existingSong.genre,
        payload.performer ?? existingSong.performer,
        payload.duration ?? existingSong.duration,
        albumId,
        id,
      ],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
