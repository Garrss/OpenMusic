const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const db = require('../config/database');

class UsersService {
  async addUser({ username, password, fullname }) {
    // Cek username unik
    const checkQuery = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const existingUser = await db.query(checkQuery);
    if (existingUser.rows.length > 0) {
      throw new Error('Username sudah digunakan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || 10),
    );
    const id = `user-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await db.query(query);

    if (!result.rows[0].id) {
      throw new Error('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      throw new Error('Username tidak ditemukan');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw new Error('Password salah');
    }

    return id;
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
}

module.exports = UsersService;
