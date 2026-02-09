const express = require('express');
const CollaborationsHandler = require('./handler');
const authMiddleware = require('../../middlewares/auth');
const { CollaborationPayloadSchema } = require('../../utils/validator');

const router = express.Router();
const collaborationsHandler = new CollaborationsHandler();

// POST collaborations
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    const { error } = CollaborationPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    next();
  },
  collaborationsHandler.postCollaboration,
);

// DELETE collaborations
router.delete(
  '/',
  authMiddleware,
  (req, res, next) => {
    const { error } = CollaborationPayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
    next();
  },
  collaborationsHandler.deleteCollaboration,
);

module.exports = router;
