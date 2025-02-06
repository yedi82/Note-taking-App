// noteController.js
const { validationResult } = require('express-validator');
const { Folder, Note, User } = require('../models');
const { convertMarkdownToHtml } = require('../utils/markdownUtils');
const { Op } = require('sequelize');

let io; 

exports.setSocket = (socketIo) => {
  io = socketIo;  // Assigns the socket.io instance
};

// Function to update a note's content
exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.update(req.body);
    io.to(note.id).emit('noteUpdated', { noteId: note.id, content: note.content });

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Error updating note' });
  }
};

// Function to retrieve all notes, with optional sorting and filtering
exports.getAllNotes = async (req, res) => {
  try {
    const { sortBy, order, folder, category } = req.query;

    // The sorting options
    const sortOptions = [];
    if (sortBy) {
      const orderOption = order === 'desc' ? 'DESC' : 'ASC';
      sortOptions.push([sortBy, orderOption]);
    }

    // The filtering options
    const filterOptions = {};
    if (folder) {
      filterOptions.folder_id = folder;
    } else if (category) {
      filterOptions.category = category;
    }

    const notes = await Note.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Folder, as: 'folder', attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'noteUserCollaborators', 
          attributes: ['id', 'username', 'email'] 
        }
      ],
      order: sortOptions,
      where: filterOptions
    });

    // Convert markdown content to HTML for each note
    const notesWithHtmlContent = notes.map((note) => {
      note.content = convertMarkdownToHtml(note.content);
      return note;
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
};

// Function to retrieve notes that are not associated with any folder
exports.getStandaloneNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const standaloneNotes = await Note.findAll({
      where: {
        folder_id: null,
        user_id: userId
      }
    });
    res.json(standaloneNotes);
  } catch (error) {
    console.error('Error fetching standalone notes:', error);
    res.status(500).json({ error: 'Error fetching notes' });
  }
};

exports.createNote = async (req, res) => {
  const { name, content, folder_id, category_id } = req.body;
  if (!name) {
      return res.status(400).json({ error: "Note name is required" });
  }

  try {
      const note = await Note.create({
          name,
          content: content || '',
          folder_id,
          category_id,
          user_id: req.user.id
      });
      res.status(201).json(note);
  } catch (error) {
      console.error('Error creating note:', error);
      res.status(400).json({ error: 'Error creating note' });
  }
};

// Function to get a note by ID, with authorization checks
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'noteUserCollaborators',
          attributes: ['id','email'], // get the id's and the emails
        },
        {
          model: Folder,
          as: 'folder',
          include: [
            {
              model: User,
              as: 'folderUserCollaborators',
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const isNoteOwner = note.user_id === req.user.id;
    const noteCollaborators = note.noteUserCollaborators.map(user => user.id);
    const isNoteCollaborator = noteCollaborators.includes(req.user.id);

    // Check for shared folder access
    const isFolderOwner = note.folder?.user_id === req.user.id;
    const folderCollaborators = note.folder?.folderUserCollaborators.map(user => user.id) || [];
    const isFolderCollaborator = folderCollaborators.includes(req.user.id);

    // Allow access if user is either the note's owner, a note collaborator, the folder's owner, or a folder collaborator
    if (!isNoteOwner && !isNoteCollaborator && !isFolderOwner && !isFolderCollaborator) {
      return res.status(403).json({ error: 'Not authorized to view this note' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    res.status(500).json({ error: 'Error fetching note' });
  }
};

exports.updateNote = async (req, res) => {
  const { content, folder_id } = req.body;

  try {
    const note = await Note.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: 'noteUserCollaborators',
          attributes: ['id'],
        },
        {
          model: Folder,
          as: 'folder',
          include: [
            {
              model: User,
              as: 'folderUserCollaborators',
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const isNoteOwner = note.user_id === req.user.id;
    const noteCollaborators = note.noteUserCollaborators.map(user => user.id);
    const isNoteCollaborator = noteCollaborators.includes(req.user.id);

    // Check if user is an owner or collaborator in the folder as well
    const isFolderOwner = note.folder?.user_id === req.user.id;
    const folderCollaborators = note.folder?.folderUserCollaborators.map(user => user.id) || [];
    const isFolderCollaborator = folderCollaborators.includes(req.user.id);

    if (!isNoteOwner && !isNoteCollaborator && !isFolderOwner && !isFolderCollaborator) {
      return res.status(403).json({ error: 'Not authorized to update this note' });
    }

    // Update the note if authorization is granted
    note.content = content || note.content;
    note.updatedAt = new Date(); // Update the timestamp

    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Error updating note' });
  }
};

// Function to handle start of editing a note, using socket.io
exports.startEditingNote = (req, res) => {
  const { noteId, userId } = req.body;
  io.to(noteId).emit('userEditing', { userId, action: 'start' });
  res.status(200).send('Started editing');
};

// Function to handle end of editing a note, using socket.io
exports.stopEditingNote = (req, res) => {
  const { noteId, userId } = req.body;
  io.to(noteId).emit('userEditing', { userId, action: 'stop' });
  res.status(200).send('Stopped editing');
};

// Function to delete a note (only for owners)
exports.deleteNote = async (req, res) => {
  try {
      const note = await Note.findOne({
          where: {
              id: req.params.id,
              user_id: req.user.id // Only the owner can delete
          }
      });

      if (!note) {
          return res.status(404).json({ error: 'Note not found' });
      }

      await note.destroy();

      res.json({ message: 'Note deleted' });
  } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Error deleting note' });
  }
};

// Function to share a note with other users
exports.shareNote = async (req, res) => {
  const { id } = req.params;
  const { collab_user_emails } = req.body;

  if (!Array.isArray(collab_user_emails) || collab_user_emails.length === 0) {
    return res.status(400).json({ error: 'collab_user_emails must be a non-empty array' });
  }

  try {
    const note = await Note.findOne({
      where: { id, user_id: req.user.id },
      include: [{ model: User, as: 'noteUserCollaborators', attributes: ['id'] }]
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }

    // Find users by email
    const users = await User.findAll({
      where: { email: collab_user_emails },
    });

    if (users.length !== collab_user_emails.length) {
      return res.status(400).json({ error: 'Some emails do not correspond to valid users' });
    }

    const userIds = users.map(user => user.id);

    // Prevent the owner from being added as a collaborator
    const validUserIds = userIds.filter(userId => userId !== req.user.id);

    await note.addNoteUserCollaborators(validUserIds);

    res.status(200).json({ message: 'Note shared successfully' });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ error: 'Error sharing note' });
  }
};

// Function to get shared notes for the user
exports.getSharedNotes = async (req, res) => {
  try {
    const sharedNotes = await Note.findAll({
      include: [{
        model: User,
        as: 'noteUserCollaborators', 
        where: { id: req.user.id },
        attributes: []
      }],
      attributes: ['id', 'name', 'content', 'folder_id', 'user_id', 'createdAt', 'updatedAt'],
    });
    //send back the shared notes with the attributes 
    res.status(200).json(sharedNotes);
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ error: 'Error fetching shared notes' });
  }
};

// Function to get recent notes, sorted by last update
exports.getRecentNotes = async (req, res) => {
  const order = req.query.order || 'DESC';
  try {
    const notes = await Note.findAll({   
      where: { user_id: req.user.id },
      include: [
        { model: Folder, as: 'folder', attributes: ['id', 'name'] },
        { 
          model: User, 
          as: 'noteUserCollaborators',
          attributes: ['id', 'email']
        }
      ],
      attributes: ['id', 'name', 'content', 'updatedAt'],
      order: [['updatedAt', order]], // Order by updatedAt field
      limit: 10 // Limit to the most recent 10 notes 
    });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching recent notes:', error);
    res.status(500).json({ error: 'Error fetching recent notes' });
  }
 
};

