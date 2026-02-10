class UsersHandler {
  constructor(service) {
    this._service = service;
  }

  postUser = async (req, res) => {
    try {
      const { username, password, fullname } = req.body;

      const userId = await this._service.addUser({
        username,
        password,
        fullname,
      });

      return res.status(201).json({
        status: 'success',
        data: { userId },
      });
    } catch (error) {
      if (error.message === 'Username sudah digunakan') {
        return res.status(400).json({
          status: 'fail',
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
}

module.exports = UsersHandler;
