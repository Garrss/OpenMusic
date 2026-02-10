const express = require('express');
const PlaylistsHandler = require('./handler');
const authMiddleware = require('../../middlewares/auth');
const {
  PlaylistPayloadSchema,
  PlaylistSongPayloadSchema,
} = require('../../utils/validator');

const router = express.Router();
const playlistsHandler = new PlaylistsHandler();

const validatePlaylistPayload = (req, res, next) => {
  const { error } = PlaylistPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

const validatePlaylistSongPayload = (req, res, next) => {
  const { error } = PlaylistSongPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

const validateDeleteSongPayload = (req, res, next) => {
  const { songId } = req.body;
  if (!songId || typeof songId !== 'string' || !songId.startsWith('song-')) {
    return res.status(400).json({
      status: 'fail',
      message: 'songId harus diisi dan valid',
    });
  }
  next();
};


router.post(
  '/',
  (req, res, next) => {
    if (!req.headers.authorization) {
      return next();
    }
    validatePlaylistPayload(req, res, next);
  },
  authMiddleware,
  playlistsHandler.postPlaylist,
);
router.get('/', authMiddleware, playlistsHandler.getPlaylists);
router.delete('/:id', authMiddleware, playlistsHandler.deletePlaylistById);


router.post(
  '/:id/songs',
  authMiddleware,
  validatePlaylistSongPayload,
  playlistsHandler.postSongToPlaylist,
);
router.get('/:id/songs', authMiddleware, playlistsHandler.getSongsFromPlaylist);
router.delete(
  '/:id/songs',
  authMiddleware,
  validateDeleteSongPayload,
  playlistsHandler.deleteSongFromPlaylist,
);

router.get('/:id/activities', authMiddleware, playlistsHandler.getActivities);

module.exports = router;
