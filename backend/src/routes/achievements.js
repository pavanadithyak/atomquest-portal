const express = require("express");
const { Op } = require("sequelize");
const { authenticateToken, requireRole } = require("../middleware/auth");
const computeProgressScore = require("../utils/progressScore");

module.exports = (sequelize, User, Achievement, Goal, Cycle) => {
  const router = express.Router();

  router.post("/", authenticateToken, async (req, res) => {
    try {
      const { goal_id, quarter, actual_value, status, employee_comments } = req.body;
      const employee_id = req.user.id;

      const cycle = await Cycle.findOne({
        where: {
          phase_name: { [Op.endsWith]: quarter.toUpperCase() },
        },
      });

      if (!cycle || !cycle.isWindowOpen()) {
        return res.status(400).json({ error: `Achievement window for ${quarter} is closed` });
      }

      const goal = await Goal.findByPk(goal_id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      const progressScore = computeProgressScore(goal.uom_type, goal.target_value, actual_value);

      const existing = await Achievement.findOne({
        where: { goal_id, employee_id, quarter },
      });

      if (existing) {
        return res.status(409).json({ error: "Achievement already recorded for this goal this quarter" });
      }

      const achievement = await Achievement.create({
        goal_id,
        employee_id,
        quarter,
        actual_value: parseFloat(actual_value),
        status,
        employee_comments,
        progress_score: Math.round(progressScore * 100) / 100,
      });

      res.status(201).json(achievement);
    } catch (error) {
      console.error("Achievement creation error:", error);
      res.status(500).json({ error: "Achievement creation failed" });
    }
  });

  router.get("/", authenticateToken, async (req, res) => {
    try {
      let where = {};

      if (req.user.role === "employee") {
        where.employee_id = req.user.id;
      } else if (req.user.role === "manager") {
        const reports = await User.findAll({
          where: { manager_id: req.user.id },
          attributes: ["id"],
        });
        where.employee_id = reports.map(r => r.id);
      }

      const achievements = await Achievement.findAll({
        where,
        include: [{ model: Goal, as: "goal" }],
      });

      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Error fetching achievements" });
    }
  });

  router.patch("/:achievementId", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const achievement = await Achievement.findByPk(req.params.achievementId);
      if (!achievement) {
        return res.status(404).json({ error: "Achievement not found" });
      }

      const { actual_value, status, employee_comments } = req.body;

      if (actual_value !== undefined) {
        const goal = await Goal.findByPk(achievement.goal_id);
        achievement.progress_score = computeProgressScore(goal.uom_type, goal.target_value, actual_value);
        achievement.actual_value = parseFloat(actual_value);
      }

      if (status) achievement.status = status;
      if (employee_comments) achievement.employee_comments = employee_comments;

      await achievement.save();
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  return router;
};
