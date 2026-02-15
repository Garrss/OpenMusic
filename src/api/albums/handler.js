const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, storageService) {
    this._service = albumsService;
    this._storageService = storageService;

    autoBind(this);
  }

  async postAlbum(req, res) {
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
  }

  async getAlbumById(req, res) {
    try {
      const { id } = req.params;

      const album = await this._service.getAlbumById(id);
      const songs = await this._service.getSongsByAlbumId(id);

      return res.status(200).json({
        status: 'success',
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            coverUrl: album.cover
              ? `${process.env.BASE_URL}/uploads/${album.cover}`
              : null,
            songs: songs.map(({ id, title, performer }) => ({
              id,
              title,
              performer,
            })),
          },
        },
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async putAlbumById(req, res) {
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
  }

  async deleteAlbumById(req, res) {
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
  }

  async postAlbumCover(req, res) {
    try {
      const { id } = req.params;
      const cover = req.file;

      if (!cover) {
        return res.status(400).json({
          status: 'fail',
          message: 'File cover harus diunggah',
        });
      }

      await this._service.getAlbumById(id);

      const oldCover = await this._service.getAlbumCover(id);
      if (oldCover) {
        await this._storageService.deleteFile(oldCover);
      }

      const filename = await this._storageService.writeFile(cover, {
        filename: cover.originalname,
      });

      await this._service.updateAlbumCover(id, filename);

      return res.status(201).json({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}

module.exports = AlbumsHandler;
