const express = require('express');
const AlbumsHandler = require('./handler');
const AlbumsService = require('../../services/AlbumsService');
const { AlbumPayloadSchema } = require('../../utils/validator');

const router = express.Router();
const albumsService = new AlbumsService();
const albumsHandler = new AlbumsHandler(albumsService);

const validateAlbumPayload = (req, res, next) => {
  const { error } = AlbumPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

router.post('/', validateAlbumPayload, albumsHandler.postAlbum);
router.get('/:id', albumsHandler.getAlbumById);
router.put('/:id', validateAlbumPayload, albumsHandler.putAlbumById);
router.delete('/:id', albumsHandler.deleteAlbumById);

module.exports = router;
