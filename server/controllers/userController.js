const bcrypt = require("bcrypt");
const { db } = require("../db");

const validateInput = (username, password) => {
  const errors = [];
  
  if (!username || typeof username !== "string" || username.trim().length === 0) {
    errors.push("Username is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  
  return errors;
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const errors = validateInput(username, password);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const users = await db('users')
      .where('username', username)
      .select('id', 'username', 'password', 'isAdmin', 'data_set', 'station');

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = users[0];
    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        data_set: user.data_set,
        station: user.station
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const errors = validateInput(username, password);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if user exists
    const existingUsers = await db('users')
      .where('username', username)
      .select('id');

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db('users').insert({
      username: username,
      password: hashedPassword,
      isAdmin: false
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

module.exports = { login, register };

// User Management Functions

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'isAdmin', 'data_set', 'station', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { username, password, isAdmin, station, data_set } = req.body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db('users')
      .where('username', username.trim())
      .first();

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Create user
    const [userId] = await db('users').insert({
      username: username.trim(),
      password: password,
      isAdmin: isAdmin || false,
      station: station || null,
      data_set: data_set || '40'
    });

    // Fetch the created user
    const newUser = await db('users')
      .where('id', userId)
      .select('id', 'username', 'isAdmin', 'data_set', 'station', 'created_at')
      .first();

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, isAdmin, station, data_set } = req.body;

    // Check if user exists
    const existingUser = await db('users')
      .where('id', id)
      .first();

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validation
    if (username) {
      if (typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid username' });
      }

      // Check if new username is already taken by another user
      const duplicateUser = await db('users')
        .where('username', username.trim())
        .whereNot('id', id)
        .first();

      if (duplicateUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username.trim();
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;
    if (station !== undefined) updateData.station = station || null;
    if (data_set !== undefined) updateData.data_set = data_set || '40';

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updateData.password = password;
    }

    // Update user
    await db('users')
      .where('id', id)
      .update(updateData);

    // Fetch updated user
    const updatedUser = await db('users')
      .where('id', id)
      .select('id', 'username', 'isAdmin', 'data_set', 'station', 'created_at', 'updated_at')
      .first();

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await db('users')
      .where('id', id)
      .first();

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself (optional - add auth middleware to check this)
    // if (req.user && req.user.id === parseInt(id)) {
    //   return res.status(403).json({ error: 'Cannot delete your own account' });
    // }

    // Delete user
    await db('users')
      .where('id', id)
      .delete();

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser.id,
        username: existingUser.username
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
};

module.exports = {
  login,
  register,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
