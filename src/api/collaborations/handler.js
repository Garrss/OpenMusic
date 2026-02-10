const CollaborationsService = require('../../services/CollaborationsService');
const PlaylistsService = require('../../services/PlaylistsService');
const UsersService = require('../../services/UsersService');

class CollaborationsHandler {
  constructor() {
    this._collaborationsService = new CollaborationsService();
    this._playlistsService = new PlaylistsService();
    this._usersService = new UsersService();
  }

  postCollaboration = async (req, res) => {
    try {
      const { playlistId, userId } = req.body;
      const ownerId = req.user.id;

      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);
      await this._usersService.getUserById(userId);

      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      return res.status(201).json({
        status: 'success',
        data: { collaborationId },
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  };

  deleteCollaboration = async (req, res) => {
    try {
      const { playlistId, userId } = req.body;
      const ownerId = req.user.id;

      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      });
    } catch (error) {
      return this._handleError(res, error);
    }
  };

  _handleError = (res, error) => {
    const errorHandlers = {
      'User tidak ditemukan': () => this._sendFail(res, error.message, 404),
      'Playlist tidak ditemukan': () => this._sendFail(res, error.message, 404),
      'Kolaborasi tidak ditemukan': () =>
        this._sendFail(res, error.message, 404),
      'Anda bukan pemilik playlist ini': () =>
        this._sendForbidden(res, error.message),
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
  };

  _sendFail = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
      status: 'fail',
      message,
    });
  };

  _sendForbidden = (res, message) => {
    return res.status(403).json({
      status: 'fail',
      message,
    });
  };
}

module.exports = CollaborationsHandler;
