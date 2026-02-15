const ProducerService = require('../../services/ProducerService');
const PlaylistsService = require('../../services/PlaylistsService');
const { ExportPayloadSchema } = require('../../utils/validator');

class ExportsHandler {
  constructor(producerService, playlistsService) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
  }

  postExportPlaylist = async (req, res) => {
    try {
      const { id: playlistId } = req.params;
      const userId = req.user.id;

      // Validasi payload
      const { error } = ExportPayloadSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'fail',
          message: error.message,
        });
      }

      const { targetEmail } = req.body;

      // Verifikasi kepemilikan playlist
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

      // Kirim ke queue
      const message = JSON.stringify({
        playlistId,
        targetEmail,
      });

      await this._producerService.sendMessage('export:playlist', message);

      return res.status(201).json({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
    } catch (error) {
      if (error.message === 'Anda bukan pemilik playlist ini') {
        return res.status(403).json({
          status: 'fail',
          message: error.message,
        });
      }
      if (error.message === 'Playlist tidak ditemukan') {
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

module.exports = ExportsHandler;
