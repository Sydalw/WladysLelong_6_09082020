const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

const rateLimiterMiddleware = require('../middleware/rateLimiterMiddleware');
const validationUserRegex = require('../middleware/validationUserMiddleware');
const pwdValidator = require('../middleware/pwdValidatorMiddleware');

router.post('/signup', validationUserRegex, pwdValidator, userCtrl.signup);
router.post('/login', rateLimiterMiddleware, validationUserRegex, userCtrl.login);

module.exports = router;
