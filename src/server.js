require('dotenv').config();
const express = require('express');

// Routes
const albumsRoutes = require('./api/albums/routes');
const songsRoutes = require('./api/songs/routes');
const usersRoutes = require('./api/users/routes');
const authenticationsRoutes = require('./api/authentications/routes');
const playlistsRoutes = require('./api/playlists/routes');
const collaborationsRoutes = require('./api/collaborations/routes');
const exportsRoutes = require('./api/exports/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(process.env.UPLOAD_DIR));

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// API Routes
app.use('/albums', albumsRoutes);
app.use('/songs', songsRoutes);
app.use('/users', usersRoutes);
app.use('/authentications', authenticationsRoutes);
app.use('/playlists', playlistsRoutes);
app.use('/collaborations', collaborationsRoutes);
app.use('/export', exportsRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({
    message: 'OpenMusic API V2',
    version: '2.0.0',
    status: 'running',
  });
});

// 404 Handler - SEDERHANA TANPA PATTERN
app.use((req, res,) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route tidak ditemukan',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
  console.log('OpenMusic API V2 Ready!');
});
