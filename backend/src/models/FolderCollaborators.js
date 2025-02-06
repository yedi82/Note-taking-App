// /src/models/FolderCollaborators.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FolderCollaborators = sequelize.define('FolderCollaborators', {
  folder_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Folders',
      key: 'id'
    },
    primaryKey: true
  },
  collaborator_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    primaryKey: true
  }
}, {
  timestamps: false,
});

module.exports = FolderCollaborators;
