const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const db = require('../config/database');

class UsersService {
  async addUser({ username, password, fullname }) {

    const existingUser = await this._checkUsernameExists(username);
    if (existingUser) {
      throw new Error('Username sudah digunakan');
    }

    const hashedPassword = await this._hashPassword(password);
    const id = `user-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await db.query(query);

    if (!result.rows[0]?.id) {
      throw new Error('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyUserCredential({ username, password }) {
    const user = await this._getUserByUsername(username);

    if (!user) {
      throw new Error('Username tidak ditemukan');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password salah');
    }

    return user.id;
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async getUsernameById(id) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [id],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      return null;
    }

    return result.rows[0].username;
  }

  async _checkUsernameExists(username) {
    const query = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);
    return result.rows.length > 0;
  }

  async _getUserByUsername(username) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);
    return result.rows[0] || null;
  }

  async _hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    return bcrypt.hash(password, saltRounds);
  }
}

module.exports = UsersService;
