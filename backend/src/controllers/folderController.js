// /src/controllers/folderController.js

// Import necessary modules
const { validationResult } = require("express-validator");
const { Note, Folder, User } = require("../models");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

/**
 * Get all folders for the authenticated user, including collaborators
 * @param {*} req - Request object
 * @param {*} res - Response object with folders data or an error message
 */
exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "folderUserCollaborators", // Updated alias
          attributes: ["id", "username", "email"],
        },
      ],
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching folders" });
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  const { name , category_id} = req.body;
  try {
    const folder = await Folder.create({
      name,
      user_id: req.user.id,
      category_id,
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: "Error creating folder" });
  }
};

// Get a folder by its ID for the authenticated user
exports.getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: "folderUserCollaborators",
          attributes: ["id"],
          where: { id: req.user.id },
          required: false, // Include the collaborator check as optional
        },
      ],
    });

    // Check if the user is either the owner or a collaborator
    if (!folder || (folder.user_id !== req.user.id && folder.folderUserCollaborators.length === 0)) {
      return res.status(404).json({ error: "Folder not found" });
    }

    res.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({ error: "Error fetching folder" });
  }
};

// Update a folder by its ID for the authenticated user
exports.updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    const { name } = req.body;
    folder.name = name || folder.name;

    await folder.save();

    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: "Error updating folder" });
  }
};

// Delete a folder and its notes by folder ID for the authenticated user
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Delete all notes in the folder
    await Note.destroy({
      where: { folder_id: folder.id },
    });

    // Delete folder
    await folder.destroy();

    res.json({ message: "Folder and its notes deleted" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Error deleting folder" });
  }
};

// Get all notes within a specified folder for the authenticated user
exports.getNotesInFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.user.id;

    // Check if the user is either the owner or a collaborator of the folder
    const folder = await Folder.findOne({
      where: { id: folderId },
      include: [
        {
          model: User,
          as: "folderUserCollaborators",
          where: { id: userId },
          required: false, 
        },
      ],
    });

    // If folder not found or user is not the owner or collaborator
    if (
      !folder ||
      (folder.user_id !== userId && folder.folderUserCollaborators.length === 0)
    ) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Fetch the notes within the folder
    const notes = await Note.findAll({
      where: { folder_id: folderId },
    });

    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes in folder:", error);
    res.status(500).json({ error: "Error fetching notes in folder" });
  }
};

// Share a folder with specified users by email
exports.shareFolder = async (req, res) => {
  const { id } = req.params;
  const { collab_user_emails } = req.body;

  if (!Array.isArray(collab_user_emails) || collab_user_emails.length === 0) {
    return res
      .status(400)
      .json({ error: "collab_user_emails must be a non-empty array" });
  }

  try {
    const folder = await Folder.findOne({
      where: { id, user_id: req.user.id },
      include: [
        { model: User, as: "folderUserCollaborators", attributes: ["id"] },
      ],
    });

    if (!folder) {
      return res
        .status(404)
        .json({ error: "Folder not found or not authorized" });
    }

    // Find users by email
    const users = await User.findAll({
      where: { email: collab_user_emails },
    });

    if (users.length !== collab_user_emails.length) {
      return res
        .status(400)
        .json({ error: "Some emails do not correspond to valid users" });
    }

    const userIds = users.map((user) => user.id);

    // Prevent the owner from being added as a collaborator
    const validUserIds = userIds.filter((userId) => userId !== req.user.id);

    await folder.addFolderUserCollaborators(validUserIds);

    res.status(200).json({ message: "Folder shared successfully" });
  } catch (error) {
    console.error("Error sharing folder:", error);
    res.status(500).json({ error: "Error sharing folder" });
  }
};

// Get all folders shared with the authenticated user
exports.getSharedFolders = async (req, res) => {
  try {
    const sharedFolders = await Folder.findAll({
      include: {
        model: User,
        as: "folderUserCollaborators", // Match the alias used in your model associations
        where: { id: req.user.id }, // get only folders where the current user is a collaborator
        attributes: [], 
      },
    });
    res.status(200).json(sharedFolders);
  } catch (error) {
    console.error("Error fetching shared folders:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentFolders = async (req, res) => {
  const order = req.query.order || 'DESC';
  try {
    const folders = await Folder.findAll({   
      where: { user_id: req.user.id },
      order: [['updatedAt', order]], // Order by updatedAt field
      limit: 10 // Limit to the most recent 10 notes
    });
    // Get the IDs of the folders to count the notes
    const folderIds = folders.map(folder => folder.id);
  
    // Fetch note counts for each folder
    const noteCounts = await Note.findAll({
      where: {
        folder_id: { [Op.in]: folderIds }
      },
      attributes: ['folder_id', [sequelize.fn('COUNT', sequelize.col('id')), 'noteCount']],
      group: ['folder_id']
    });

    // Create a map of folder ID to note count
    const folderCountMap = {};
    noteCounts.forEach(({ folder_id, dataValues }) => {
      folderCountMap[folder_id] = dataValues.noteCount;
    });

    // Add note count to each folder's response
    const foldersWithCount = folders.map(folder => {
      return {
        ...folder.toJSON(),
        noteCount: folderCountMap[folder.id] || 0
      };
    });
    res.json(foldersWithCount);
  } catch (error) {
    console.error('Error fetching recent folders:', error);
    res.status(500).json({ error: 'Error fetching recent folders' });
  }
 
};
