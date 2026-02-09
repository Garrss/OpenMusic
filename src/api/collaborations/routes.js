const express = require('express');
const CollaborationsHandler = require('./handler');
const authMiddleware = require('../../middlewares/auth');

const router = express.Router();
const collaborationsHandler = new CollaborationsHandler();

// Apply auth middleware
router.use(authMiddleware);

router.post('/', collaborationsHandler.postCollaboration);
router.delete('/', collaborationsHandler.deleteCollaboration);

module.exports = router;
