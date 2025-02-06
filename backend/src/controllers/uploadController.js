// controllers/uploadController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure the uploads/avatars directory exists
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}${ext}`);
  }
});

// Initialize multer with storage settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB
  },
  fileFilter: function (req, file, cb) {
    // Accept image files only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
    } else {
      cb(null, true);
    }
  }
}).single('image'); // 'image' is the field name in the form data

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  //ensure that the headers include an auth part
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  //decode the tokem
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Controller function to handle upload
const uploadAvatar = (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(400).json({ error: err.message });
        } else if (err) {
          console.error('Unknown upload error:', err);
          return res.status(400).json({ error: err.message });
        }
        //ensure the file exists
        if (!req.file) {
          console.error('No file received');
          return res.status(400).json({ error: 'No file uploaded' });
        }

    // Upload successful
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    try {
      await User.update({ avatar_url: avatarUrl }, { where: { id: req.user.id } });
      res.json({ message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update avatar URL in database' });
    }
  });
};

//Export so that it can be used in other pasrt of application
module.exports = {
  authenticate,
  uploadAvatar,
};
