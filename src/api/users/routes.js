const express = require('express');
const UsersHandler = require('./handler');

const router = express.Router();
const usersHandler = new UsersHandler();

router.post('/', usersHandler.postUser);

module.exports = router;
