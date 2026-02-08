const AlbumsService = require('../../services/AlbumsService');
const { AlbumPayloadSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
} = require('../../utils/response');

class AlbumsHandler {
  constructor() {
    this._service = new AlbumsService();

    this.postAlbum = this.postAlbum.bind(this);
    this.getAlbumById = this.getAlbumById.bind(this);
    this.putAlbumById = this.putAlbumById.bind(this);
    this.deleteAlbumById = this.deleteAlbumById.bind(this);
  }

  postAlbum = async (req, res) => {
    try {
      const { error } = AlbumPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { name, year } = req.body;
      const albumId = await this._service.addAlbum({ name, year });

      return successResponse(res, {
        data: { albumId },
        statusCode: 201,
      });
    } catch (error) {
      return errorResponse(res, { message: error.message });
    }
  };

  getAlbumById = async (req, res) => {
    try {
      const { id } = req.params;
      const album = await this._service.getAlbumById(id);

      const songs = await this._service.getSongsByAlbumId(id);

      return successResponse(res, {
        data: {
          album: {
            ...album,
            songs: songs.map((song) => ({
              id: song.id,
              title: song.title,
              performer: song.performer,
            })),
          },
        },
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return failResponse(res, {
          message: 'Album tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  putAlbumById = async (req, res) => {
    try {
      const { error } = AlbumPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { id } = req.params;
      const { name, year } = req.body;

      await this._service.editAlbumById(id, { name, year });

      return successResponse(res, {
        message: 'Album berhasil diperbarui',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: 'Gagal memperbarui album. Id tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  deleteAlbumById = async (req, res) => {
    try {
      const { id } = req.params;
      await this._service.deleteAlbumById(id);

      return successResponse(res, {
        message: 'Album berhasil dihapus',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: 'Album gagal dihapus. Id tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = AlbumsHandler;
