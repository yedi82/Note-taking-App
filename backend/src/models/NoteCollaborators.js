// /src/models/NoteCollaborators.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NoteCollaborators = sequelize.define('NoteCollaborators', {
  note_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Notes',
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

module.exports = NoteCollaborators;
