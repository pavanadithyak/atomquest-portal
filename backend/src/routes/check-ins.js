const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");

module.exports = (sequelize, User, GoalSheet, Goal, CheckIn, Achievement) => {
  const router = express.Router();

  router.get("/", authenticateToken, requireRole("manager", "admin"), async (req, res) => {
    try {
      const { quarter } = req.query;
      let where = {};

      if (quarter) where.quarter = quarter;

      if (req.user.role === "manager") {
        const reports = await User.findAll({
          where: { manager_id: req.user.id },
          attributes: ["id"],
        });
        where.employee_id = reports.map(r => r.id);
      }

      const checkIns = await CheckIn.findAll({
        where,
        include: [
          { model: Goal, as: "goal" },
        ],
      });

      res.json(checkIns);
    } catch (error) {
      console.error("Get check-ins error:", error);
      res.status(500).json({ error: "Error fetching check-ins" });
    }
  });

  router.post("/", authenticateToken, requireRole("manager", "admin"), async (req, res) => {
    try {
      const { goal_id, employee_id, quarter, manager_comment, confidence_level, support_needed } = req.body;

      const achievement = await Achievement.findOne({
        where: { goal_id, employee_id, quarter },
      });

      if (!achievement) {
        return res.status(400).json({ error: "Employee has not submitted achievement yet" });
      }

      const existing = await CheckIn.findOne({
        where: { goal_id, manager_id: req.user.id, quarter },
      });

      if (existing) {
        return res.status(409).json({ error: "Check-in already exists for this goal/quarter" });
      }

      const checkIn = await CheckIn.create({
        goal_id,
        employee_id,
        manager_id: req.user.id,
        quarter,
        manager_comment,
        confidence_level,
        support_needed: support_needed || false,
      });

      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Check-in creation error:", error);
      res.status(500).json({ error: "Check-in creation failed" });
    }
  });

  router.patch("/:checkInId", authenticateToken, async (req, res) => {
    try {
      const checkIn = await CheckIn.findByPk(req.params.checkInId);
      if (!checkIn) {
        return res.status(404).json({ error: "Check-in not found" });
      }

      if (req.user.id !== checkIn.manager_id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { manager_comment, confidence_level, support_needed } = req.body;

      if (manager_comment) checkIn.manager_comment = manager_comment;
      if (confidence_level) checkIn.confidence_level = confidence_level;
      if (support_needed !== undefined) checkIn.support_needed = support_needed;

      await checkIn.save();
      res.json(checkIn);
    } catch (error) {
      console.error("Check-in update error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  return router;
};
