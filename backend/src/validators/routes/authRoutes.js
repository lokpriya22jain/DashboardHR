// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../validators/controllers/authController');

// Map endpoints to point exactly to your frontend hooks
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;