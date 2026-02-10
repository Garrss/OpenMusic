const express = require('express');
const AuthenticationsHandler = require('./handler');
const {
  AuthenticationPayloadSchema,
  RefreshTokenPayloadSchema,
} = require('../../utils/validator');

const router = express.Router();
const authenticationsHandler = new AuthenticationsHandler();

const validateAuthenticationPayload = (req, res, next) => {
  const { error } = AuthenticationPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

const validateRefreshTokenPayload = (req, res, next) => {
  const { error } = RefreshTokenPayloadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
  next();
};

router.post(
  '/',
  validateAuthenticationPayload,
  authenticationsHandler.postAuthentication,
);

router.put(
  '/',
  validateRefreshTokenPayload,
  authenticationsHandler.putAuthentication,
);

router.delete(
  '/',
  validateRefreshTokenPayload,
  authenticationsHandler.deleteAuthentication,
);

module.exports = router;
