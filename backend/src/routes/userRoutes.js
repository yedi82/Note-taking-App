// /src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { searchUsers, getCurrentUser, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect the routes to ensure only authenticated users can access them
router.get('/search', authMiddleware, searchUsers);


// Route to get the current authenticated user's profile
router.get('/me', authMiddleware, getCurrentUser);

// Route to update the current authenticated user's profile
router.put('/me', authMiddleware, updateUser); 

module.exports = router;
