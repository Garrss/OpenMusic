const UsersService = require('../../services/UsersService');
const AuthenticationsService = require('../../services/AuthenticationsService');
const TokenManager = require('../../utils/token');

class AuthenticationsHandler {
  constructor() {
    this._usersService = new UsersService();
    this._authenticationsService = new AuthenticationsService();
  }

  postAuthentication = async (req, res) => {
    try {
      const { username, password } = req.body;

      const id = await this._usersService.verifyUserCredential({
        username,
        password,
      });

      const accessToken = TokenManager.generateAccessToken({ id });
      const refreshToken = TokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return res.status(201).json({
        status: 'success',
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      return this._handleAuthError(res, error);
    }
  };

  putAuthentication = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = TokenManager.verifyRefreshToken(refreshToken);

      const accessToken = TokenManager.generateAccessToken({ id });

      return res.status(200).json({
        status: 'success',
        data: { accessToken },
      });
    } catch (error) {
      return this._handleTokenError(res, error);
    }
  };

  deleteAuthentication = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return res.status(200).json({
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      return this._handleTokenError(res, error);
    }
  };

  _handleAuthError = (res, error) => {
    if (
      error.message === 'Username tidak ditemukan' ||
      error.message === 'Password salah'
    ) {
      return res.status(401).json({
        status: 'fail',
        message: 'Kredensial yang Anda berikan salah',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  };

  _handleTokenError = (res, error) => {
    if (
      error.message === 'Refresh token tidak valid' ||
      error.message === 'Refresh token tidak ditemukan'
    ) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  };
}

module.exports = AuthenticationsHandler;
