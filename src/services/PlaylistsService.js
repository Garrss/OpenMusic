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

    if (!result.rows[0] || !result.rows[0].id) {
      throw new Error('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    // Get playlists yang dimiliki user
    const ownedPlaylistsQuery = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.owner = $1`,
      values: [owner],
    };

    const ownedPlaylists = await db.query(ownedPlaylistsQuery);

    // Get playlists yang user kolaborasi (jika ada tabel collaborations)
    let collaboratedPlaylists = { rows: [] };

    try {
      const collaboratedQuery = {
        text: `SELECT p.id, p.name, u.username 
               FROM playlists p 
               JOIN collaborations c ON p.id = c.playlist_id 
               JOIN users u ON p.owner = u.id 
               WHERE c.user_id = $1`,
        values: [owner],
      };
      collaboratedPlaylists = await db.query(collaboratedQuery);
    } catch {
      // Tabel collaborations mungkin belum ada (opsional)
    }

    // Gabungkan hasil
    return [...ownedPlaylists.rows, ...collaboratedPlaylists.rows];
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

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new Error('Anda bukan pemilik playlist ini');
    }
  }

  // Di bagian verifyPlaylistAccess, pastikan error message tepat
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      // Cek apakah user adalah owner
      const ownerQuery = {
        text: 'SELECT owner FROM playlists WHERE id = $1',
        values: [playlistId],
      };

      const ownerResult = await db.query(ownerQuery);

      if (!ownerResult.rows.length) {
        throw new Error('Playlist tidak ditemukan');
      }

      if (ownerResult.rows[0].owner === userId) {
        return true; // User adalah owner
      }

      // Cek apakah user adalah kolaborator
      try {
        const collabQuery = {
          text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
          values: [playlistId, userId],
        };
        const collabResult = await db.query(collabQuery);

        if (collabResult.rows.length > 0) {
          return true; // User adalah kolaborator
        }
      } catch (collabError) {
        // Tabel collaborations tidak ada, lanjutkan
      }

      // Jika bukan owner dan bukan kolaborator, throw 403 error
      throw new Error('Anda tidak memiliki akses ke playlist ini');
    } catch (error) {
      // Propagate error dengan message yang jelas
      if (error.message.includes('tidak ditemukan')) {
        throw new Error('Playlist tidak ditemukan');
      }
      throw error;
    }
  }

  // Methods untuk playlist songs
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
        // Unique violation
        throw new Error('Lagu sudah ada di playlist');
      }
      if (error.code === '23503') {
        // Foreign key violation
        throw new Error('Playlist atau lagu tidak ditemukan');
      }
      throw error;
    }
  }

  async getSongsFromPlaylist(playlistId) {
    // Get playlist info
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await db.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    // Get songs in playlist
    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s 
             JOIN playlist_songs ps ON s.id = ps.song_id 
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await db.query(songsQuery);

    return {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
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

  // Method untuk activities (Opsional 2)
  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };

    await db.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT
               u.username,
               s.title,
               psa.action,
               psa.time
             FROM playlist_song_activities psa
             JOIN users u ON psa.user_id = u.id
             JOIN songs s ON psa.song_id = s.id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time DESC`,
      values: [playlistId],
    };

    const result = await db.query(query);
    return result.rows;
  }
}



module.exports = PlaylistsService;
