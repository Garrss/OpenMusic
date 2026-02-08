const express = require('express');
const AlbumsHandler = require('./handler');

const router = express.Router();
const handler = new AlbumsHandler();

router.post('/', handler.postAlbum);
router.get('/:id', handler.getAlbumById);
router.put('/:id', handler.putAlbumById);
router.delete('/:id', handler.deleteAlbumById);

module.exports = router;
