const UsersService = require('../../services/UsersService');
const { UserPayloadSchema } = require('../../utils/validator');
const {
  successResponse,
  failResponse,
  errorResponse,
} = require('../../utils/response');

class UsersHandler {
  constructor() {
    this._service = new UsersService();
  }

  postUser = async (req, res) => {
    try {
      const { error } = UserPayloadSchema.validate(req.body);
      if (error) {
        return failResponse(res, { message: error.message });
      }

      const { username, password, fullname } = req.body;
      const userId = await this._service.addUser({
        username,
        password,
        fullname,
      });

      return successResponse(res, {
        data: { userId },
        statusCode: 201,
      });
    } catch (error) {
      if (error.message === 'Username sudah digunakan') {
        return failResponse(res, { message: error.message });
      }
      return errorResponse(res, { message: error.message });
    }
  };
}

module.exports = UsersHandler;
