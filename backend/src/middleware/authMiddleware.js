// /src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Adjust the path based on your project structure

const publicPaths = ['/auth/challenge', '/auth/get-credentials'];

module.exports = async (req, res, next) => {
  // Skip JWT check for public paths
  if (publicPaths.some(path => req.originalUrl.startsWith(path))) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email'] // Fetch only necessary fields
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
