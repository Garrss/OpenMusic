class SongsHandler {
  constructor(service) {
    this._service = service;
  }

  postSong = async (req, res) => {
    try {
      const songId = await this._service.addSong(req.body);

      return res.status(201).json({
        status: 'success',
        data: { songId },
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: 'Album tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  getSongs = async (req, res) => {
    try {
      const { title = '', performer = '' } = req.query;
      const songs = await this._service.getSongs(title, performer);

      return res.status(200).json({
        status: 'success',
        data: { songs },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  getSongById = async (req, res) => {
    try {
      const { id } = req.params;
      const song = await this._service.getSongById(id);

      return res.status(200).json({
        status: 'success',
        data: { song },
      });
    } catch (error) {
      if (error.message === 'Lagu tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: 'Lagu tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  putSongById = async (req, res) => {
    try {
      const { id } = req.params;
      await this._service.editSongById(id, req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          status: 'fail',
          message: error.message,
        });
      }
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: 'Album tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  deleteSongById = async (req, res) => {
    try {
      const { id } = req.params;
      await this._service.deleteSongById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Lagu berhasil dihapus',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          status: 'fail',
          message: 'Lagu gagal dihapus. Id tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
}

module.exports = SongsHandler;
