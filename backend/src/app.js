// /src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 
const noteRoutes = require('./routes/noteRoutes');
const folderRoutes = require('./routes/folderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 

// Middleware
const allowedOrigins = [
  'http://localhost:3000',       // Local development
  process.env.REACT_APP_API_URL     // Ngrok URL
];

app.set('trust proxy', 1);  // 1 trusts the first proxy in the chain

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true  
}));

app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/auth', authRoutes);        // For login/signup
app.use('/users', userRoutes);        // For user-related actions
app.use('/notes', noteRoutes);       // For notes CRUD
app.use('/folders', folderRoutes);   // For folders CRUD
app.use('/categories', categoryRoutes); // For categories CRUD
app.use('/api', uploadRoutes);

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(`Error on ${req.method} ${req.url}: ${err.message}`);
  res.status(err.status || 500).json({ message: err.message });
});


module.exports = app;
