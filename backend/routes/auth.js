const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

// ── POST /api/register (User / Adopter) 
router.post("/register", async (req, res) => {
  const { full_name, email, password, phone, address } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: "Full name, email and password are required." });
  }

  try {
    // Check for existing user
    const [existing] = await pool.query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (full_name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone || null, address || null]
    );

    res.json({ success: true, message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// ── POST /api/login (User / Adopter) 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, password, phone, address FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Remove password before sending
    const { password: _pwd, ...safeUser } = user;
    safeUser.role = "adopter";
    res.json({ success: true, message: "Login successful.", user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// ── POST /api/admin/login 
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT admin_id, username, password, full_name FROM admins WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Remove password before sending
    const { password: _pwd, ...safeAdmin } = admin;
    safeAdmin.role = "admin";
    res.json({ success: true, message: "Admin login successful.", user: safeAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// ── PUT /api/users/:id (Update profile — phone & address)
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { phone, address } = req.body;

  try {
    await pool.query(
      "UPDATE users SET phone = ?, address = ? WHERE user_id = ?",
      [phone || null, address || null, id]
    );

    // Return updated user data
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, phone, address FROM users WHERE user_id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updatedUser = rows[0];
    updatedUser.role = "adopter";
    res.json({ success: true, message: "Profile updated successfully.", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

module.exports = router;
