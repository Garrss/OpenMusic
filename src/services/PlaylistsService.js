const { nanoid } = require('nanoid');
const db = require('../config/database');

class PlaylistsService {
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await db.query(query);

    if (!result.rows[0]?.id) {
      throw new Error('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const ownedPlaylists = await this._getOwnedPlaylists(owner);
    const collaboratedPlaylists = await this._getCollaboratedPlaylists(owner);

    return [...ownedPlaylists, ...collaboratedPlaylists];
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT p.id, p.name, u.username, p.owner 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.id = $1`,
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new Error('Anda bukan pemilik playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const playlist = await this._getPlaylistOwner(playlistId);

    if (playlist.owner === userId) {
      return true;
    }

    const isCollaborator = await this._isCollaborator(playlistId, userId);
    if (isCollaborator) {
      return true;
    }

    throw new Error('Anda tidak memiliki akses ke playlist ini');
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    try {
      const result = await db.query(query);
      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Lagu sudah ada di playlist');
      }
      if (error.code === '23503') {
        throw new Error('Playlist atau lagu tidak ditemukan');
      }
      throw error;
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const playlist = await this._getPlaylistInfo(playlistId);
    const songs = await this._getSongsInPlaylist(playlistId);

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Lagu tidak ditemukan di playlist');
    }
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    await db.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time
             FROM playlist_song_activities psa
             JOIN users u ON psa.user_id = u.id
             JOIN songs s ON psa.song_id = s.id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time ASC`,
      values: [playlistId],
    };

    const result = await db.query(query);
    return result.rows;
  }

  // ========== PRIVATE HELPER METHODS ==========

  async _getOwnedPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.owner = $1`,
      values: [owner],
    };

    const result = await db.query(query);
    return result.rows;
  }

  async _getCollaboratedPlaylists(owner) {
    try {
      const query = {
        text: `SELECT p.id, p.name, u.username 
               FROM playlists p 
               JOIN collaborations c ON p.id = c.playlist_id 
               JOIN users u ON p.owner = u.id 
               WHERE c.user_id = $1`,
        values: [owner],
      };
      const result = await db.query(query);
      return result.rows;
    } catch {
      return [];
    }
  }

  async _getPlaylistOwner(playlistId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async _isCollaborator(playlistId, userId) {
    try {
      const query = {
        text: 'SELECT 1 FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
        values: [playlistId, userId],
      };
      const result = await db.query(query);
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }

  async _getPlaylistInfo(playlistId) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async _getSongsInPlaylist(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s 
             JOIN playlist_songs ps ON s.id = ps.song_id 
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
