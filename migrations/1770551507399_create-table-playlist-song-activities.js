/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

exports.shorthands = shorthands;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(10)',
      notNull: true,
      check: "action IN ('add', 'delete')",
    },
    time: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Foreign key constraints
  pgm.addConstraint(
    'playlist_song_activities',
    'fk_activities.playlist_id_playlists.id',
    {
      foreignKeys: {
        columns: 'playlist_id',
        references: 'playlists(id)',
        onDelete: 'CASCADE',
      },
    },
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_activities.song_id_songs.id',
    {
      foreignKeys: {
        columns: 'song_id',
        references: 'songs(id)',
        onDelete: 'CASCADE',
      },
    },
  );

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_activities.user_id_users.id',
    {
      foreignKeys: {
        columns: 'user_id',
        references: 'users(id)',
        onDelete: 'CASCADE',
      },
    },
  );
};
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
