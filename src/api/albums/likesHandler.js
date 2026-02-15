const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(likesService, albumsService) {
    this._likesService = likesService;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postLike(req, res) {
    try {
      const { id: albumId } = req.params;
      const { id: userId } = req.user;

      await this._albumsService.getAlbumById(albumId);
      await this._likesService.addLike(userId, albumId);

      return res.status(201).json({
        status: 'success',
        message: 'Album berhasil disukai',
      });
    } catch (error) {
      if (
        error.message === 'Album tidak ditemukan' ||
        error.message === 'Anda sudah menyukai album ini'
      ) {
        return res
          .status(error.message === 'Album tidak ditemukan' ? 404 : 400)
          .json({
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

  async deleteLike(req, res) {
    try {
      const { id: albumId } = req.params;
      const { id: userId } = req.user;

      await this._albumsService.getAlbumById(albumId);
      await this._likesService.deleteLike(userId, albumId);

      return res.status(200).json({
        status: 'success',
        message: 'Batal menyukai album berhasil',
      });
    } catch (error) {
      if (
        error.message === 'Album tidak ditemukan' ||
        error.message === 'Anda belum menyukai album ini'
      ) {
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

  async getLikes(req, res) {
    try {
      const { id: albumId } = req.params;

      await this._albumsService.getAlbumById(albumId);

      const { count, fromCache } =
        await this._likesService.getLikesCount(albumId);

      if (fromCache) {
        res.set('X-Data-Source', 'cache');
      }

      return res.status(200).json({
        status: 'success',
        data: { likes: count },
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

module.exports = AlbumLikesHandler;
