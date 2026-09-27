'use strict';

const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', requireAuth, auth.me);
router.patch('/me', requireAuth, auth.updateMe);
router.patch('/me/password', requireAuth, auth.changePassword);

module.exports = router;
