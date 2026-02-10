const express = require('express');
const UsersHandler = require('./handler');
const UsersService = require('../../services/UsersService');
const { UserPayloadSchema } = require('../../utils/validator');

const router = express.Router();
const usersService = new UsersService();
const usersHandler = new UsersHandler(usersService);

const validateUserPayload = (req, res, next) => {
  const { error } = UserPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

router.post('/', validateUserPayload, usersHandler.postUser);

module.exports = router;
