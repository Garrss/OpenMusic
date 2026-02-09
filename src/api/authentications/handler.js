const UsersService = require('../../services/UsersService');
const AuthenticationsService = require('../../services/AuthenticationsService');
const TokenManager = require('../../utils/token');
const {
  AuthenticationPayloadSchema,
  RefreshTokenPayloadSchema,
} = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
} = require('../../utils/response');

class AuthenticationsHandler {
  constructor() {
    this._usersService = new UsersService();
    this._authenticationsService = new AuthenticationsService();
  }

  postAuthentication = async (req, res) => {
    try {
      const { error } = AuthenticationPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { username, password } = req.body;

      const id = await this._usersService.verifyUserCredential({
        username,
        password,
      });

      const accessToken = TokenManager.generateAccessToken({ id });
      const refreshToken = TokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      return successResponse(res, {
        data: {
          accessToken,
          refreshToken,
        },
        statusCode: 201,
      });
    } catch (error) {
      if (
        error.message === 'Username tidak ditemukan' ||
        error.message === 'Password salah'
      ) {
        return failResponse(res, {
          message: 'Kredensial yang Anda berikan salah',
          statusCode: 401,
        });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  putAuthentication = async (req, res) => {
    try {
      const { error } = RefreshTokenPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { refreshToken } = req.body;

      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = TokenManager.verifyRefreshToken(refreshToken);

      const accessToken = TokenManager.generateAccessToken({ id });

      return successResponse(res, {
        data: { accessToken },
      });
    } catch (error) {
      if (error.message === 'Refresh token tidak valid') {
        return failResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };

  deleteAuthentication = async (req, res) => {
    try {
      const { error } = RefreshTokenPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { refreshToken } = req.body;

      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return successResponse(res, {
        message: 'Refresh token berhasil dihapus',
      });
    } catch (error) {
      if (error.message === 'Refresh token tidak ditemukan') {
        return failResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = AuthenticationsHandler;
