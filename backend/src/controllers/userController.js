// /src/controllers/userController.js
const { Op } = require('sequelize');
const { User } = require('../models');

// Controller to search for users by their email prefix.
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const users = await User.findAll({
      where: {
        email: {
          [Op.like]: `${query}%` // Matches emails starting with the query
        },
        id: {
          [Op.ne]: req.user.id // Exclude the current user
        }
      },
      attributes: ['id', 'username', 'email'] // Only fetch necessary fields
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
};

// Controller to fetch the current logged-in user's details.
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'avatar_url'], // Include avatar_url
    });
    //check that the user exists in the database
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // send back the user to client
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Error fetching current user' });
  }
};

// Controller to update the current user's username.
exports.updateUser = async (req, res) => {
  try {
    const { username } = req.body;
    // Validate the username field
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findByPk(req.user.id);
    //check that the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Update and save the user's username
    user.username = username;
    await user.save();

    res.status(200).json({ message: "User updated successfully", username: user.username });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};
