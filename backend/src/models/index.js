// /src/models/index.js
const { Op } = require('sequelize');
const User = require('./User');
const Note = require('./Note');
const Folder = require('./Folder');
const FolderCollaborators = require('./FolderCollaborators');
const NoteCollaborators = require('./NoteCollaborators');
const Category = require('./Category');

// A User can have many Notes
User.hasMany(Note, { foreignKey: 'user_id', as: 'ownedNotes' });
Note.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// A User can have many Folders
User.hasMany(Folder, { foreignKey: 'user_id', as: 'ownedFolders' });
Folder.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// A Folder can have many Notes
Folder.hasMany(Note, { foreignKey: 'folder_id', as: 'notes' });
Note.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });

// A Category can have many Notes
Category.hasMany(Note, { foreignKey: 'category_id', as: 'notes' });
Note.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Many-to-Many for Folder Collaborators with unique aliases
Folder.belongsToMany(User, { 
  through: FolderCollaborators, 
  as: 'folderUserCollaborators', // Unique alias for Folder collaborators
  foreignKey: 'folder_id',
  otherKey: 'collaborator_id'
});
User.belongsToMany(Folder, { 
  through: FolderCollaborators, 
  as: 'sharedFolders', // Unique alias for Folders shared with User
  foreignKey: 'collaborator_id',
  otherKey: 'folder_id'
});

// Many-to-Many for Note Collaborators with unique aliases
Note.belongsToMany(User, { 
  through: NoteCollaborators, 
  as: 'noteUserCollaborators', // Unique alias for Note collaborators
  foreignKey: 'note_id',
  otherKey: 'collaborator_id'
});
User.belongsToMany(Note, { 
  through: NoteCollaborators, 
  as: 'sharedNotes', // Unique alias for Notes shared with User
  foreignKey: 'collaborator_id',
  otherKey: 'note_id'
});

// Export all models and Sequelize operators
module.exports = {
  User,
  Note,
  Folder,
  FolderCollaborators,
  NoteCollaborators,
  Category,
  Op
};
