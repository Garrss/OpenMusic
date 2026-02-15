const express = require('express');
const ExportsHandler = require('./handler');
const ProducerService = require('../../services/ProducerService');
const PlaylistsService = require('../../services/PlaylistsService');
const authMiddleware = require('../../middlewares/auth');

const router = express.Router();

// Inisialisasi di dalam route
router.post('/playlists/:id', authMiddleware, (req, res) => {
  const producerService = new ProducerService();
  const playlistsService = new PlaylistsService();
  const exportsHandler = new ExportsHandler(producerService, playlistsService);

  return exportsHandler.postExportPlaylist(req, res);
});

module.exports = router;
