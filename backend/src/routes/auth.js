const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");

module.exports = (sequelize) => {
  const router = express.Router();
  const User = require("../models/User")(sequelize);

  router.post("/register", async (req, res) => {
    try {
      const { email, password, first_name, last_name, role = "employee" } = req.body;

      if (!email || !password || password.length < 8) {
        return res.status(400).json({ error: "Email and password (min 8 chars) required" });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email,
        password_hash,
        first_name: first_name || "User",
        last_name: last_name || "",
        role,
      });

      const { password_hash: _, ...userObj } = user.get();
      res.status(201).json(userObj);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your_jwt_secret_key_change_this",
        { expiresIn: "7d" }
      );

      const { password_hash: _, ...userObj } = user.get();
      res.status(200).json({ token, user: userObj });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  router.get("/me", authenticateToken, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password_hash: _, ...userObj } = user.get();
      res.json(userObj);
    } catch (error) {
      res.status(500).json({ error: "Error fetching user" });
    }
  });

  router.post("/logout", (req, res) => {
    res.json({ message: "Logged out (discard token client-side)" });
  });

  return router;
};
