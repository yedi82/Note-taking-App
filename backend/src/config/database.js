// /src/config/database.js
const { Sequelize } = require('sequelize');
const { Client } = require('pg');
require('dotenv').config();
const { URL } = require('url');

const databaseUrl = process.env.DATABASE_URL;

// Extract the database name from the URL
const dbUrl = new URL(databaseUrl);
const dbName = dbUrl.pathname.slice(1);

// Create a new URL for the 'postgres' database
const adminDbUrl = new URL(databaseUrl);
adminDbUrl.pathname = '/postgres'; // Connect to 'postgres' database

// Create Sequelize instance
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: console.log, // Set to 'console.log' for debugging
  timezone: 'Africa/Johannesburg', // Set the timezone
});

// Function to create the database if it doesn't exist
const createDatabase = async () => {
  // Initialize a new PostgreSQL client using the admin connection string
  const client = new Client({
    connectionString: adminDbUrl.toString(),
  });

  try {
    await client.connect();
    
    // Check if the database already exists by querying the system catalog
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname=$1`,
      [dbName]
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    // Log and rethrow any errors encountered during the database creation process
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
};

// Export the Sequelize instance and the createDatabase function for use 
//in other parts of the application
module.exports = {
  sequelize,
  createDatabase,
};
