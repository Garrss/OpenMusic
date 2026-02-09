const express = require('express');
const AuthenticationsHandler = require('./handler');

const router = express.Router();
const authenticationsHandler = new AuthenticationsHandler();

router.post('/', authenticationsHandler.postAuthentication);
router.put('/', authenticationsHandler.putAuthentication);
router.delete('/', authenticationsHandler.deleteAuthentication);

module.exports = router;
