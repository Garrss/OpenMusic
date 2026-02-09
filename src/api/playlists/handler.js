const PlaylistsService = require('../../services/PlaylistsService');
const SongsService = require('../../services/SongsService');
const { PlaylistSongPayloadSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
  forbiddenResponse,
} = require('../../utils/response');

class PlaylistsHandler {
  constructor() {
    this._service = new PlaylistsService();
    this._songsService = new SongsService();
  }

  postPlaylist = async (req, res) => {
    try {
      const { name } = req.body;
      const owner = req.user.id;

      const playlistId = await this._service.addPlaylist({ name, owner });

      return res.status(201).json({
        status: 'success',
        data: {
          playlistId,
        },
      });
    } catch (error) {
      return errorResponse(res, { message: error.message });
    }
  };

  // Di handler getPlaylists, tambahkan logging untuk debug
  getPlaylists = async (req, res) => {
    try {
      const owner = req.user.id;
      console.log('Getting playlists for user:', owner);

      const playlists = await this._service.getPlaylists(owner);
      console.log('Found playlists:', playlists.length, playlists);

      return successResponse(res, {
        data: { playlists },
      });
    } catch (error) {
      return errorResponse(res, { message: error.message });
    }
  };

  deletePlaylistById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify ownership
      await this._service.verifyPlaylistOwner(id, userId);

      await this._service.deletePlaylistById(id);

      return successResponse(res, {
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Anda bukan pemilik playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  postSongToPlaylist = async (req, res) => {
    try {
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const userId = req.user.id;

      // Verify playlist access - ini bisa throw 'Anda tidak memiliki akses ke playlist ini'
      await this._service.verifyPlaylistAccess(playlistId, userId);

      // Verify song exists
      try {
        await this._songsService.getSongById(songId);
      } catch (songError) {
        return failResponse(res, {
          message: 'Lagu tidak ditemukan',
          statusCode: 404,
        });
      }

      // Add song to playlist
      await this._service.addSongToPlaylist(playlistId, songId);

      // Add activity (opsional)
      try {
        await this._service.addActivity(playlistId, songId, userId, 'add');
      } catch {
        // Ignore jika tabel activities tidak ada
      }

      return res.status(201).json({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
    } catch (error) {
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Anda tidak memiliki akses ke playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      if (error.message === 'Lagu sudah ada di playlist') {
        return failResponse(res, { message: error.message });
      }
      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: 'Playlist atau lagu tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  getSongsFromPlaylist = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify playlist access
      await this._service.verifyPlaylistAccess(id, userId);

      const playlist = await this._service.getSongsFromPlaylist(id);

      return successResponse(res, {
        data: { playlist },
      });
    } catch (error) {
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Anda tidak memiliki akses ke playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  deleteSongFromPlaylist = async (req, res) => {
    try {
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const userId = req.user.id;

      // Verify playlist access
      await this._service.verifyPlaylistAccess(playlistId, userId);

      // Delete song from playlist
      await this._service.deleteSongFromPlaylist(playlistId, songId);

      // Add activity (opsional)
      try {
        await this._service.addActivity(playlistId, songId, userId, 'delete');
      } catch {
        // Ignore jika tabel activities tidak ada
      }

      return successResponse(res, {
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Anda tidak memiliki akses ke playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      if (error.message === 'Lagu tidak ditemukan di playlist') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  // Opsional 2: Get activities
  getActivities = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify playlist access
      await this._service.verifyPlaylistAccess(id, userId);

      const activities = await this._service.getActivities(id);

      return successResponse(res, {
        data: {
          playlistId: id,
          activities,
        },
      });
    } catch (error) {
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Anda tidak memiliki akses ke playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = PlaylistsHandler;
