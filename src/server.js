require('dotenv').config();
const express = require('express');

// Routes V1
const albumsRoutes = require('./api/albums/routes');
const songsRoutes = require('./api/songs/routes');

// Routes V2
const usersRoutes = require('./api/users/routes');
const authenticationsRoutes = require('./api/authentications/routes');
const playlistsRoutes = require('./api/playlists/routes');
const collaborationsRoutes = require('./api/collaborations/routes'); // Opsional

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// V1 Routes (tidak butuh auth)
app.use('/albums', albumsRoutes);
app.use('/songs', songsRoutes);

// V2 Routes
app.use('/users', usersRoutes);
app.use('/authentications', authenticationsRoutes);
app.use('/playlists', playlistsRoutes);
app.use('/collaborations', collaborationsRoutes); // Opsional

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'OpenMusic API V2',
    version: '2.0.0',
    status: 'running',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route tidak ditemukan',
  });
});

// Error handling middleware
app.use((err, req, res,) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server berjalan pada http://${HOST}:${PORT}`);
  console.log('OpenMusic API V2 Ready!');
});
