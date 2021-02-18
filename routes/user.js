const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

const rateLimiterMiddleware = require('../middleware/rateLimiterMiddleware');

router.post('/signup', userCtrl.signup);
router.post('/login', rateLimiterMiddleware, userCtrl.login);

module.exports = router;
