const SongsService = require('../../services/SongsService');
const { SongPayloadSchema, SongUpdateSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
} = require('../../utils/response');

class SongsHandler {
  constructor() {
    this._service = new SongsService();

    this.postSong = this.postSong.bind(this);
    this.getSongs = this.getSongs.bind(this);
    this.getSongById = this.getSongById.bind(this);
    this.putSongById = this.putSongById.bind(this);
    this.deleteSongById = this.deleteSongById.bind(this);
  }

  postSong = async (req, res) => {
    try {
      console.log('Request body:', req.body);
      const { error } = SongPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const songId = await this._service.addSong(req.body);

      return successResponse(res, {
        data: { songId },
        statusCode: 201,
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

  getSongs = async (req, res) => {
    try {
      const { title = '', performer = '' } = req.query;
      const songs = await this._service.getSongs(title, performer);

      return successResponse(res, {
        data: { songs },
      });
    } catch (error) {
      return errorResponse(res, { message: error.message });
    }
  };

  getSongById = async (req, res) => {
    try {
      const { id } = req.params;
      const song = await this._service.getSongById(id);

      return successResponse(res, {
        data: { song },
      });
    } catch (error) {
      if (error.message === 'Lagu tidak ditemukan') {
        return failResponse(res, {
          message: 'Lagu tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  putSongById = async (req, res) => {
    try {
      console.log('PUT /songs/:id - Body:', req.body);

      const { error } = SongUpdateSchema.validate(req.body, { abortEarly: true, });
      if (error) {
        console.log('Validation error:', error.message);
        return failResponse(res, {
          message: error.message,
          statusCode: 400,
        });
      }

      const { id } = req.params;
      await this._service.editSongById(id, req.body);

      return successResponse(res, {
        message: 'Lagu berhasil diperbarui',
      });
    } catch (error) {
      console.error('Error in putSongById:', error.message);

      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: error.message,
          statusCode: 404,
        });
      }

      if (error.message === 'Album tidak ditemukan') {
        return failResponse(res, {
          message: 'Album tidak ditemukan',
          statusCode: 404,
        });
      }

      return errorResponse(res, { message: error.message });
    }
  };

  deleteSongById = async (req, res) => {
    try {
      const { id } = req.params;
      await this._service.deleteSongById(id);

      return successResponse(res, {
        message: 'Lagu berhasil dihapus',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return failResponse(res, {
          message: 'Lagu gagal dihapus. Id tidak ditemukan',
          statusCode: 404,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = SongsHandler;
