// /src/routes/folderRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllFolders,
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
  getNotesInFolder,
  shareFolder,
  getSharedFolders, // Import the getSharedFolders method
  getRecentFolders
} = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);

// Route to get recently accessed folders
router.get('/recent', getRecentFolders);


// Route to get folders shared 
router.get('/shared', authMiddleware, getSharedFolders); // This should be placed before dynamic routes to prevent conflict

// Route to get all folders owned by the user
router.get('/', getAllFolders);

// Route to create a new folder
router.post(
  '/',
  [check('name').notEmpty().withMessage('Folder name is required')],
  createFolder
);

// Route to get a specific folder by its ID
router.get('/:id', getFolderById);

// Route to update an existing folder by its ID
router.put(
  '/:id',
  [check('name').optional().notEmpty().withMessage('Folder name cannot be empty')],
  updateFolder
);

// Route to delete a folder by its ID
router.delete('/:id', deleteFolder);

// Route to get all notes within a specific folder by the folder's ID
router.get('/:id/notes', getNotesInFolder);

// Route to share a folder with other users via their email addresses
router.post(
  '/:id/share',
  [
    check('collab_user_emails')
      .isArray({ min: 1 })
      .withMessage('collab_user_emails must be a non-empty array of emails'),
    check('collab_user_emails.*').isEmail().withMessage('Each collaborator email must be valid'),
  ],
  shareFolder
);

//export it so that it can be used in othe rparts of application
module.exports = router;
