const bcrypt = require("bcrypt");
const { pool } = require("../db");

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

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT id, username, password, isAdmin, data_set FROM users WHERE username = ?",
      [username]
    );
    connection.release();

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
        data_set: user.data_set
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

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)",
      [username, hashedPassword, false]
    );
    connection.release();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

module.exports = { login, register };
