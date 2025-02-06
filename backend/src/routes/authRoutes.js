// /src/routes/authRoutes.js

//import modules
const express = require('express');
const { check, validationResult } = require('express-validator');
const { signup, login , requestPasswordReset, resetPassword, getChallenge, registerPasskey, getCredentials, passkeyLogin, deleteUser} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for checking authentication
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');

//regular expression to endforce strong passwords
const strongPasswordRegex = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])');

//route for user signup with input validation and rate limiting
router.post(
  '/signup',
  rateLimiter, // Apply rate limiting to prevent abuse
  [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(strongPasswordRegex).withMessage('Password must contain at least one lowercase letter,one uppercase letter, one number, and one special character'),
  ],
  signup // Controller function for handling signup
);

// Route for user login with input validation
router.post(
  '/login',
  rateLimiter,
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  login // Controller function for handling login
);

// Route for requesting a password reset
router.post(
  '/request-password-reset',
  [
    check('email').isEmail().withMessage('Valid email is required'),
  ],
  requestPasswordReset // Controller function to handle reset password
);

// Route for resetting password using a token
router.post(
  '/reset-password/:token',
  [
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(strongPasswordRegex).withMessage('Password must contain at least one lowercase letter,one uppercase letter, one number, and one special character'),
  ],
  resetPassword
);
  
// Route to get a challenge for passkey registration
router.get('/challenge', getChallenge);

// Route to register a passkey
router.post('/register-passkey', registerPasskey);

// Route to get user credentials; requires authentication
router.get('/get-credentials', authMiddleware, getCredentials);

// Route for passkey-based login
router.post('/passkey-login', passkeyLogin);

// Route to delete a user; requires authentication using middleware
router.delete('/delete-user', authMiddleware, deleteUser);

// Export the router to be used in the main server file
module.exports = router;