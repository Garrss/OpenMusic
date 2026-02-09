const CollaborationsService = require('../../services/CollaborationsService');
const PlaylistsService = require('../../services/PlaylistsService');
const { CollaborationPayloadSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
  forbiddenResponse,
} = require('../../utils/response');
const UsersService = require('../../services/UsersService');

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

      console.log('\n=== POST COLLABORATION ===');
      console.log('Playlist ID:', playlistId);
      console.log('User ID to add:', userId);
      console.log('Owner ID:', ownerId);

      // Verify playlist owner
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      // VERIFIKASI: User yang akan dijadikan collaborator harus ada
      try {
        await this._usersService.getUserById(userId);
      } catch (userError) {
        console.log('User not found:', userError.message);
        return failResponse(res, {
          message: 'User tidak ditemukan',
          statusCode: 404,
        });
      }

      const collaborationId =
        await this._collaborationsService.addCollaboration(playlistId, userId);

      return res.status(201).json({
        status: 'success',
        data: {
          collaborationId,
        },
      });
    } catch (error) {
      console.log('Post collaboration error:', error.message);

      if (error.message === 'Anda bukan pemilik playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'User tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message === 'Kolaborasi sudah ada') {
        return failResponse(res, {
          message: error.message,
          statusCode: 400,
        });
      }

      return errorResponse(res, { message: error.message });
    }
  };

  deleteCollaboration = async (req, res) => {
    try {
      const { error } = CollaborationPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { playlistId, userId } = req.body;
      const ownerId = req.user.id;

      console.log('\n=== DELETE COLLABORATION ===');
      console.log('Playlist ID:', playlistId);
      console.log('User ID to remove:', userId);
      console.log('Requester ID:', ownerId);

      // Verify playlist owner - hanya owner yang bisa menghapus collaboration
      await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return successResponse(res, {
        message: 'Kolaborasi berhasil dihapus',
      });
    } catch (error) {
      console.log('Delete collaboration error:', error.message);

      if (error.message === 'Anda bukan pemilik playlist ini') {
        return forbiddenResponse(res, { message: error.message });
      }
      if (error.message === 'Playlist tidak ditemukan') {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }
      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: 'Kolaborasi tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = CollaborationsHandler;
