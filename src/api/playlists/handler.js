const PlaylistsService = require('../../services/PlaylistsService');
const SongsService = require('../../services/SongsService');
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor() {
    this._service = new PlaylistsService();
    this._songsService = new SongsService();

    autoBind(this);
  }

  async postPlaylist(req, res) {
    try {
      const { name } = req.body;
      const owner = req.user.id;

      const playlistId = await this._service.addPlaylist({ name, owner });

      return res.status(201).json({
        status: 'success',
        data: { playlistId },
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async getPlaylists(req, res) {
    try {
      const owner = req.user.id;
      const playlists = await this._service.getPlaylists(owner);

      return res.status(200).json({
        status: 'success',
        data: { playlists },
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async deletePlaylistById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this._service.verifyPlaylistOwner(id, userId);
      await this._service.deletePlaylistById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async postSongToPlaylist(req, res) {
    try {
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const userId = req.user.id;

      await this._service.verifyPlaylistAccess(playlistId, userId);
      await this._songsService.getSongById(songId);
      await this._service.addSongToPlaylist(playlistId, songId);

      this._addActivityIfExists(playlistId, songId, userId, 'add');

      return res.status(201).json({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async getSongsFromPlaylist(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this._service.verifyPlaylistAccess(id, userId);
      const playlist = await this._service.getSongsFromPlaylist(id);

      return res.status(200).json({
        status: 'success',
        data: { playlist },
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async deleteSongFromPlaylist(req, res) {
    try {
      const { id: playlistId } = req.params;
      const { songId } = req.body;
      const userId = req.user.id;

      await this._service.verifyPlaylistAccess(playlistId, userId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);

      this._addActivityIfExists(playlistId, songId, userId, 'delete');

      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  async getActivities(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this._service.verifyPlaylistAccess(id, userId);
      const activities = await this._service.getActivities(id);

      return res.status(200).json({
        status: 'success',
        data: { playlistId: id, activities },
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  }

  _handleError(res, error) {
    const errorHandlers = {
      'Playlist tidak ditemukan': () => this._sendFail(res, error.message, 404),
      'Lagu tidak ditemukan': () => this._sendFail(res, error.message, 404),
      'Lagu tidak ditemukan di playlist': () =>
        this._sendFail(res, error.message, 404),
      'Playlist atau lagu tidak ditemukan': () =>
        this._sendFail(res, error.message, 404),
      'User tidak ditemukan': () => this._sendFail(res, error.message, 404),
      'Kolaborasi tidak ditemukan': () =>
        this._sendFail(res, error.message, 404),
      'Anda bukan pemilik playlist ini': () =>
        this._sendForbidden(res, error.message),
      'Anda tidak memiliki akses ke playlist ini': () =>
        this._sendForbidden(res, error.message),
      'Lagu sudah ada di playlist': () =>
        this._sendFail(res, error.message, 400),
      'Kolaborasi sudah ada': () => this._sendFail(res, error.message, 400),
    };

    const handler = errorHandlers[error.message];
    if (handler) {
      return handler();
    }

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }

  _sendFail(res, message, statusCode = 400) {
    return res.status(statusCode).json({
      status: 'fail',
      message,
    });
  }

  _sendForbidden(res, message) {
    return res.status(403).json({
      status: 'fail',
      message,
    });
  }

  _addActivityIfExists(playlistId, songId, userId, action) {
    try {
      this._service.addActivity(playlistId, songId, userId, action);
    } catch {
      // Ignore
    }
  }
}

module.exports = PlaylistsHandler;
