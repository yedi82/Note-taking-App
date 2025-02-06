// /src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { User, Note, Folder } = require('../models');
require('dotenv').config();
const Sequelize = require('sequelize');


// Configure Nodemailer to use Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Gmail account in env
    pass: process.env.GMAIL_PASS,  // Gmail app password in env
  },
});

/**
 * This function deletes a user from a database. It takes in the id
 * of a user, finds the corresponding user (ids in database are unique - PK),
 * then deletes that corresponds users notes, then folders, then the user itself
 * @param {*} req Contains user to be deleted
 * @param {*} res Confirmation of user deletion (we use the status of the response)
 * @returns 
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all notes associated with the user
    await Note.destroy({ where: { user_id: userId } });

    // Delete all folders associated with the user
    await Folder.destroy({ where: { user_id: userId } });

    // Delete the user itself
    const deletedUser = await User.destroy({ where: { id: userId } });

    if (deletedUser) {
      res.status(200).json({ message: 'User and all associated data deleted successfully.' });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

// Function to generate a random challenge
const generateChallenge = () => {
  return crypto.randomBytes(32).toString('base64url'); // Generates a random challenge of 32 bytes
};


//route handler to get a challenge
exports.getChallenge = async (req, res) => {
  const challenge = generateChallenge();

  const email = req.query.email;
  
  const user = await User.findOne({ where: { email } });
  
  //if user exists send back the information to client
  if (user){
    const credentialId = user.credentialId;

    const username = user.username;
    
    return res.status(200).json({ challenge, credentialId , username});
    
  }


  res.status(201).json({ challenge, credentialId: null });
};

// Register a passkey for a user
exports.registerPasskey = async (req, res) => {
  try {
      const { username, credential, publicKey } = req.body;

      // Check if the username exists
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Find the user in the database
      const user = await User.findOne({ where: { username } });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Proceed to register the passkey
      await user.update({
          credentialId: credential.id,
          publicKey: publicKey,
      });

      res.status(200).json({ message: 'Passkey registered successfully' });
  } catch (error) {
      console.error('Error registering passkey:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

//  Fetch user credentials based on email
const getUserCredentials = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: ['credentialId', 'publicKey'], // Adjust as necessary
  });

  if (!user) {
    throw new Error('User not found');
  }

  return [
    {
      id: user.credentialId, // Ensure this matches what your frontend expects
      type: 'publicKey',
      publicKey: user.publicKey,
    },
  ];
};

// Handles user signup, creating a new account
exports.getCredentials = async (req, res) => {
  try {
    
    const email = req.query.email;
    const user = await User.findOne({error: {email}})
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve registered credentials from the database
    const credentials = await getUserCredentials(user.id); 

    res.status(200).json(credentials);
  } catch (error) {
    console.error("Error retrieving credentials:", error);
    res.status(500).json({ error: "Could not retrieve credentials" });
  }
};


// Handles user sign up
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check if the username is already in use
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(409).json({ error: "Username already in use" });
    }

    // Create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      credentialId: null,  
      publicKey: null,      
    });

    // Generate challenge for passkey registration
    const challenge = generateChallenge();
    
    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
        // Check if the error is due to unique constraint violation
    if (error instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).json({ error: "credentialId must be unique" });
    }
    res.status(500).json({ error: "An error occurred during signup" });
  }
};

// Handles user sign up
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let tokenExpiration = null;
    if (rememberMe) {
      tokenExpiration = '7d';  // 7 days for "Remember me"
    } else {
      tokenExpiration = '1h'; // 1 hour for normal login
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiration }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

// Request a password reset by sending a reset link via email
exports.requestPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    // return a success message for security reasons
    if (!user) {
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate a token
    const token = crypto.randomBytes(32).toString('hex');

    // Set token and expiration on user record
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: `"Marker App" <${process.env.GMAIL_USER}>`,  // Sender address
      to: user.email,  // List of receivers
      subject: 'Password Reset Request',  // Subject line
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'An error occurred during the password reset request' });
  }
};

//  Reset password using a token
exports.resetPassword = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user by token and check expiration
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    //check user's password reset token
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'An error occurred during the password reset' });
  }
};

// Authenticate a user using passkey
exports.passkeyLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Check if the credential is provided
    if (!credential) {
      return res.status(400).json({ error: 'Credential is required' });
    }
    //find user in the database
    const user = await User.findOne({ where: { credentialId: credential.id } });
   
    //check user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await verifyCredential(credential, user.publicKey);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credential' });
    }

    // If valid, generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.json({ token });
  } catch (error) {
    console.error('Passkey login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// validate the received credential
async function verifyCredential(credential, publicKey) {
  return true; 
}