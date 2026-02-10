class AlbumsHandler {
  constructor(service) {
    this._service = service;
  }

  postAlbum = async (req, res) => {
    try {
      const { name, year } = req.body;
      const albumId = await this._service.addAlbum({ name, year });

      return res.status(201).json({
        status: 'success',
        data: { albumId },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  getAlbumById = async (req, res) => {
    try {
      const { id } = req.params;
      const album = await this._service.getAlbumById(id);
      const songs = await this._service.getSongsByAlbumId(id);

      return res.status(200).json({
        status: 'success',
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

  putAlbumById = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, year } = req.body;

      await this._service.editAlbumById(id, { name, year });

      return res.status(200).json({
        status: 'success',
        message: 'Album berhasil diperbarui',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          status: 'fail',
          message: 'Gagal memperbarui album. Id tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  deleteAlbumById = async (req, res) => {
    try {
      const { id } = req.params;
      await this._service.deleteAlbumById(id);

      return res.status(200).json({
        status: 'success',
        message: 'Album berhasil dihapus',
      });
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return res.status(404).json({
          status: 'fail',
          message: 'Album gagal dihapus. Id tidak ditemukan',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
}

module.exports = AlbumsHandler;
