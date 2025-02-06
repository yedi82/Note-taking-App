// noteRoutes.js
const express = require('express');
const router = express.Router();
const Note = require('../models/Note'); // Adjust the path as needed

const {
  getAllNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  shareNote,
  getSharedNotes,
  getStandaloneNotes,
  getRecentNotes
} = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

const { check } = require('express-validator');

// Apply authentication middleware to all routes below
router.use(authMiddleware);

router.get('/recent', getRecentNotes);

// Specific Routes First
router.get('/shared', getSharedNotes);       // Handle /notes/shared
router.get('/standalone', getStandaloneNotes); // Handle /notes/standalone

// Share Note
router.post(
  '/:id/share',
  [
    check('collab_user_emails')
      .isArray({ min: 1 })
      .withMessage('collab_user_emails must be a non-empty array of emails'),
    check('collab_user_emails.*').isEmail().withMessage('Each collaborator email must be valid'),
  ],
  shareNote
);

// Dynamic Routes Last
router.get('/:id',/* authorizeNote, */ getNoteById);             // Handle /notes/:id
router.put('/:id', /* authorizeNote, */ updateNote);              // Handle PUT /notes/:id
router.delete('/:id', /* authorizeNote, */ deleteNote);           // Handle DELETE /notes/:id
router.get('/', getAllNotes);                // Handle GET /notes/
router.post('/', createNote);                // Handle POST /notes/

module.exports = router;