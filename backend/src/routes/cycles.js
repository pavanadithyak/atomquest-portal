const express = require("express");
const { authenticateToken } = require("../middleware/auth");

module.exports = (sequelize, Cycle) => {
  const router = express.Router();

  router.get("/", authenticateToken, async (req, res) => {
    try {
      const cycles = await Cycle.findAll({
        order: [["created_at", "DESC"]],
      });
      res.json(cycles);
    } catch (error) {
      console.error("Cycle list error:", error);
      res.status(500).json({ error: "Error fetching cycles" });
    }
  });

  return router;
};
