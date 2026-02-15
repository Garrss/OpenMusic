const Joi = require('joi');

// POST & PUT /albums
const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

// POST /songs
const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().optional(),
  albumId: Joi.string().optional(),
});

// PUT /songs/{id}
const SongUpdateSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().optional(),
  albumId: Joi.string().optional(),
});

// Users & Authentications
const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const AuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const RefreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Playlists
const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

// Collaborations
const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const ExportPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = { AlbumPayloadSchema, SongPayloadSchema, SongUpdateSchema, UserPayloadSchema, AuthenticationPayloadSchema, RefreshTokenPayloadSchema, PlaylistPayloadSchema, PlaylistSongPayloadSchema, CollaborationPayloadSchema, ExportPayloadSchema };
