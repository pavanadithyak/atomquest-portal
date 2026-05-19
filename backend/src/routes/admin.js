const express = require("express");
const { Op } = require("sequelize");
const { authenticateToken, requireRole } = require("../middleware/auth");

module.exports = (sequelize, GoalSheet, Goal, Achievement, AuditLog, User) => {
  const router = express.Router();

  router.get("/audit-logs", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { startDate, endDate, goal_id, user_id, action } = req.query;
      let where = {};

      if (startDate && endDate) {
        where.timestamp = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
      if (goal_id) where.entity_id = goal_id;
      if (user_id) where.user_id = user_id;
      if (action) where.action = action;

      const logs = await AuditLog.findAll({
        where,
        order: [["timestamp", "DESC"]],
        limit: 100,
      });

      res.json(logs);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ error: "Error fetching audit logs" });
    }
  });

  router.get("/completion-dashboard", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const phaseGoals = await GoalSheet.count({
        where: { status: "submitted" },
      });

      const approvedGoals = await GoalSheet.count({
        where: { status: "approved" },
      });

      const achievementsSubmitted = await Achievement.count({
        where: { status: { [Op.ne]: "pending" } },
      });

      const totalGoals = await GoalSheet.count();

      res.json({
        phase1: {
          goals_submitted: phaseGoals,
          goals_approved: approvedGoals,
          goals_pending: phaseGoals - approvedGoals,
        },
        current_quarter: "Q1",
        quarter_status: {
          achievements_submitted: achievementsSubmitted,
          achievements_total: totalGoals * 3,
        },
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Error fetching dashboard" });
    }
  });

  router.get("/reports/achievement", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { cycle_id, format = "json" } = req.query;

      const sheets = await GoalSheet.findAll({
        include: [
          { model: Goal, as: "goals", include: [{ model: Achievement, as: "achievements" }] },
          { model: User, as: "employee", attributes: ["first_name", "last_name"] },
        ],
      });

      if (format === "csv") {
        let csv = "Employee,Goal,Target,Actual,Progress%,Status\n";
        sheets.forEach(sheet => {
          if (!sheet.goals) return;
          sheet.goals.forEach(goal => {
            const achievement = goal.achievements && goal.achievements[0];
            const actual = achievement ? achievement.actual_value : "";
            const progress = achievement ? achievement.progress_score : "";
            const status = achievement ? achievement.status : "";
            csv += `"${sheet.employee.first_name}","${goal.title}","${goal.target_value}","${actual}","${progress}","${status}"\n`;
          });
        });

        res.header("Content-Type", "text/csv");
        res.header("Content-Disposition", "attachment; filename=achievement_report.csv");
        res.send(csv);
      } else {
        res.json(sheets);
      }
    } catch (error) {
      console.error("Report error:", error);
      res.status(500).json({ error: "Error generating report" });
    }
  });

  router.get("/users", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password_hash"] },
      });
      res.json(users);
    } catch (error) {
      console.error("User list error:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  router.patch("/unlock-goal/:goalSheetId", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { reason } = req.body;
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet || !goalSheet.is_locked) {
        return res.status(400).json({ error: "Goal sheet not locked or not found" });
      }

      goalSheet.is_locked = false;
      await goalSheet.save();

      await AuditLog.create({
        user_id: req.user.id,
        action: "goal_unlocked",
        entity_type: "goal_sheet",
        entity_id: goalSheet.id,
        new_value: reason,
      });

      res.json({ message: "Goal sheet unlocked", goalSheet });
    } catch (error) {
      console.error("Unlock error:", error);
      res.status(500).json({ error: "Unlock failed" });
    }
  });

  return router;
};
