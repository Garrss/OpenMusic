class AlbumLikesHandler {
  constructor(likesService, albumsService) {
    this._likesService = likesService;
    this._albumsService = albumsService;
  }

  postLike = async (req, res) => {
    try {
      const { id: albumId } = req.params;
      const userId = req.user.id;

      // Cek apakah album ada
      await this._albumsService.getAlbumById(albumId);

      await this._likesService.addLike(userId, albumId);

      return res.status(201).json({
        status: 'success',
        message: 'Album berhasil disukai',
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: error.message,
        });
      }
      if (error.message === 'Anda sudah menyukai album ini') {
        return res.status(400).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  deleteLike = async (req, res) => {
    try {
      const { id: albumId } = req.params;
      const userId = req.user.id;

      // Cek apakah album ada
      await this._albumsService.getAlbumById(albumId);

      await this._likesService.deleteLike(userId, albumId);

      return res.status(200).json({
        status: 'success',
        message: 'Batal menyukai album berhasil',
      });
    } catch (error) {
      if (error.message === 'Album tidak ditemukan') {
        return res.status(404).json({
          status: 'fail',
          message: error.message,
        });
      }
      if (error.message === 'Anda belum menyukai album ini') {
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
  };

  getLikes = async (req, res) => {
    try {
      const { id: albumId } = req.params;

      // Cek apakah album ada
      await this._albumsService.getAlbumById(albumId);

      const { count, fromCache } =
        await this._likesService.getLikesCount(albumId);

      // Set header jika dari cache
      if (fromCache) {
        res.set('X-Data-Source', 'cache');
      }

      return res.status(200).json({
        status: 'success',
        data: {
          likes: count,
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
  };
}

module.exports = AlbumLikesHandler;
