const express = require('express');

const ExportsHandler = require('./handler');
const ProducerService = require('../../services/ProducerService');
const PlaylistsService = require('../../services/PlaylistsService');
const authMiddleware = require('../../middlewares/auth');

const router = express.Router();

const producerService = new ProducerService();
const playlistsService = new PlaylistsService();

const exportsHandler = new ExportsHandler(producerService, playlistsService);

router.post(
  '/playlists/:id',
  authMiddleware,
  exportsHandler.postExportPlaylist,
);

module.exports = router;
