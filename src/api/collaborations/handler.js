const CollaborationsService = require('../../services/CollaborationsService');
const PlaylistsService = require('../../services/PlaylistsService');
const UsersService = require('../../services/UsersService');
const { CollaborationPayloadSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
  forbiddenResponse,
} = require('../../utils/response');

class CollaborationsHandler {
  constructor() {
    this._collaborationsService = new CollaborationsService();
    this._playlistsService = new PlaylistsService();
    this._usersService = new UsersService();
  }

  postCollaboration = async (req, res) => {
    try {
      const { error } = CollaborationPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { playlistId, userId } = req.body;
      const ownerId = req.user.id;

      // Verify playlist ownership
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      // Verify user exists
      await this._usersService.getUserById(userId);

      // Add collaboration
      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      return successResponse(res, {
        data: { collaborationId },
        statusCode: 201,
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
      if (error.message === 'User tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Kolaborasi sudah ada') {
        return failResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  deleteCollaboration = async (req, res) => {
    try {
      const { playlistId, userId } = req.query;
      const ownerId = req.user.id;

      if (!playlistId || !userId) {
        return failResponse(res, {
          message: 'playlistId dan userId harus diisi',
        });
      }

      // Verify playlist ownership
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      // Delete collaboration
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return successResponse(res, {
        message: 'Kolaborasi berhasil dihapus',
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
      if (error.message === 'Kolaborasi tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = CollaborationsHandler;
