const express = require('express');
const SongsHandler = require('./handler');

const router = express.Router();
const handler = new SongsHandler();

router.post('/', handler.postSong);
router.get('/', handler.getSongs);
router.get('/:id', handler.getSongById);
router.put('/:id', handler.putSongById);
router.delete('/:id', handler.deleteSongById);

module.exports = router;
