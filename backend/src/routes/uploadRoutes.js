// routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// route for avatar upload
router.post('/upload-avatar', uploadController.authenticate, uploadController.uploadAvatar);

module.exports = router;
