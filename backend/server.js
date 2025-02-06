// server.js
const app = require('./src/app');
const { sequelize, createDatabase } = require('./src/config/database');
require('./src/models');
const http = require('http');
const { initSocket } = require('./src/config/socket'); 
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server); // Initialize io and store it

// Pass `io` to the controller (do this only if `noteController` requires `io`)
const noteController = require('./src/controllers/noteController');
noteController.setSocket(io);



const startServer = async () => {
  try {
    await createDatabase();
    await sequelize.authenticate();
    console.log('Database connected...');
    await sequelize.sync({ force: true });
    console.log('Database synced and tables created');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();


// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close the database connection
    sequelize.close()
      .then(() => {
        console.log('Database connection closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing database connection:', err);
        process.exit(1);
      });
  });

  // Close all socket connections
  io.close(() => {
    console.log('Socket.io server closed');
  });

  // Force close the server after a timeout in case of hanging connections
  setTimeout(() => {
    console.warn('Forcing server shutdown');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
