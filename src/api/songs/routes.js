const express = require('express');
const SongsHandler = require('./handler');
const SongsService = require('../../services/SongsService');
const { SongPayloadSchema } = require('../../utils/validator');

const router = express.Router();
const songsService = new SongsService();
const songsHandler = new SongsHandler(songsService);

const validateSongPayload = (req, res, next) => {
  const { error } = SongPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

router.post('/', validateSongPayload, songsHandler.postSong);
router.get('/', songsHandler.getSongs);
router.get('/:id', songsHandler.getSongById);
router.put('/:id', validateSongPayload, songsHandler.putSongById);
router.delete('/:id', songsHandler.deleteSongById);

module.exports = router;
