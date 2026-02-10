const express = require('express');
const CollaborationsHandler = require('./handler');
const authMiddleware = require('../../middlewares/auth');
const { CollaborationPayloadSchema } = require('../../utils/validator');

const router = express.Router();
const collaborationsHandler = new CollaborationsHandler();

const validateCollaborationPayload = (req, res, next) => {
  const { error } = CollaborationPayloadSchema.validate(req.body);
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
  authMiddleware,
  validateCollaborationPayload,
  collaborationsHandler.postCollaboration,
);
router.delete(
  '/',
  authMiddleware,
  validateCollaborationPayload,
  collaborationsHandler.deleteCollaboration,
);

module.exports = router;
