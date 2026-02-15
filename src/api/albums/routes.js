const express = require('express');
const multer = require('multer');
const AlbumsHandler = require('./handler');
const AlbumsService = require('../../services/AlbumsService');
const StorageService = require('../../services/StorageService');
const CacheService = require('../../services/CacheService');
const AlbumLikesService = require('../../services/AlbumLikesService');
const AlbumLikesHandler = require('./likesHandler');
const authMiddleware = require('../../middlewares/auth');
const { AlbumPayloadSchema } = require('../../utils/validator');

const router = express.Router();

// Inisialisasi services
const albumsService = new AlbumsService();
const storageService = new StorageService(process.env.UPLOAD_DIR);
const cacheService = new CacheService();
const albumLikesService = new AlbumLikesService(cacheService);

// Inisialisasi handlers
const albumsHandler = new AlbumsHandler(albumsService, storageService);
const albumLikesHandler = new AlbumLikesHandler(
  albumLikesService,
  albumsService,
);

// Initialize storage
storageService.initialize().catch(console.error);

// Setup multer untuk upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 512000, // 500KB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/jpg',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file harus berupa gambar (JPEG, PNG, GIF)'), false);
    }
  },
});

// Validation middleware
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

// ========== ALBUM ROUTES ==========
router.post('/', validateAlbumPayload, albumsHandler.postAlbum);
router.get('/:id', albumsHandler.getAlbumById);
router.put('/:id', validateAlbumPayload, albumsHandler.putAlbumById);
router.delete('/:id', albumsHandler.deleteAlbumById);

// ========== COVER ROUTES ==========
// Route untuk test dengan auth (valid & invalid files)
router.post('/:id/covers', (req, res) => {
  upload.single('cover')(req, res, (err) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'fail',
        message: 'Ukuran file maksimal 500KB',
      });
    }

    if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message,
      });
    }

    return albumsHandler.postAlbumCover(req, res);
  });
});

// ========== LIKES ROUTES ==========
router.post('/:id/likes', authMiddleware, albumLikesHandler.postLike);
router.delete('/:id/likes', authMiddleware, albumLikesHandler.deleteLike);
router.get('/:id/likes', albumLikesHandler.getLikes);

module.exports = router;
