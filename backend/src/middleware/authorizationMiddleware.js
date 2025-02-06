// /src/middleware/authorizationMiddleware.js
const { User, Note, Category } = require('../models'); 

// Middleware to authorize access to a specific note
const authorizeNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    // Fetch the note, including collaborators
    const note = await Note.findOne({
      where: { id: noteId },
      include: [{
        model: User,
        as: 'noteUserCollaborators', // Match the alias used in Note-User association to get collaborators
        attributes: ['id'],
      }],
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the requesting user is the owner of the note
    const isOwner = note.user_id === userId;

    // Get IDs of all collaborators for the note
    const collaboratorIds = note.noteUserCollaborators.map(user => user.id);

     // Check if the requesting user is one of the collaborators
    const isCollaborator = collaboratorIds.includes(userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to access this note' });
    }

    // If access is authorized, proceed to the next middleware or controller
    next();
  } catch (error) {
    console.error('authorizeNote Middleware Error:', error);
    next(error);
  }
};

// Middleware to authorize access to a specific category
const authorizeCategory = async (req, res, next) => {
  try {
    console.log('authorizeCategory Middleware: Start');
    const categoryId = req.params.id;
    const userId = req.user.id;

    // Fetch the category by its ID
    const category = await Category.findByPk(categoryId);

    if (!category) {
      console.error(`authorizeCategory Middleware: Category not found (ID: ${categoryId})`);
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if the requesting user is the owner of the category
    if (category.user_id !== userId) {
      console.error(`authorizeCategory Middleware: User ${userId} not authorized to access Category ${categoryId}`);
      return res.status(403).json({ message: 'Not authorized to access this category' });
    }

    console.log('authorizeCategory Middleware: Access granted');
    // If access is authorized, proceed to the next middleware or controller
    next();
  } catch (error) {
    console.error('authorizeCategory Middleware Error:', error);
    next(error);
  }
};

module.exports = { authorizeNote, authorizeCategory };
