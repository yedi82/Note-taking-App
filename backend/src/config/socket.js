//src/config/socket.js
const socketIo = require('socket.io');
const Note = require('../models/Note');

let io;
const initSocket = (server) => {
  io = socketIo(server);
  io.on('connection', (socket) => {
    //console.log(`Client connected: ${socket.id}`);

    socket.on('joinNote', (noteId) => {
      socket.join(noteId);
      console.log(`Client ${socket.id} joined note ${noteId}`);
    });

    socket.on('leaveNote', (noteId) => {
      socket.leave(noteId);
      console.log(`Client ${socket.id} left note ${noteId}`);
    });

    socket.on('noteUpdated', async ({ noteId, content }) => {
      try {
        const note = await Note.findByPk(noteId);
        if (note) {
          await note.update({ content });
          io.to(noteId).emit('noteUpdated', { noteId, content });
          console.log(`Note ${noteId} updated by client ${socket.id}`);
        }
      } catch (error) {
        console.error('Error updating note:', error);
      }
    });

    socket.on('disconnect', () => {
      //console.log(`Client disconnected: ${socket.id}`);
    });
  });
  return io; // Return the `io` instance
};

module.exports = { initSocket };
