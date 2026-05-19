const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");

module.exports = (sequelize, User, GoalSheet, Goal) => {
  const router = express.Router();

  router.get("/pending-approvals", authenticateToken, requireRole("manager", "admin"), async (req, res) => {
    try {
      let where = { status: "submitted" };

      if (req.user.role === "manager") {
        const reports = await User.findAll({
          where: { manager_id: req.user.id },
          attributes: ["id"],
        });
        where.employee_id = reports.map(r => r.id);
      }

      const sheets = await GoalSheet.findAll({
        where,
        include: [
          { model: Goal, as: "goals" },
          { model: User, as: "employee", attributes: ["first_name", "last_name", "email"] },
        ],
      });

      res.json(sheets);
    } catch (error) {
      res.status(500).json({ error: "Error fetching pending approvals" });
    }
  });

  router.patch("/approve/:goalSheetId", authenticateToken, requireRole("manager", "admin"), async (req, res) => {
    try {
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet || goalSheet.status !== "submitted") {
        return res.status(400).json({ error: "Goal sheet not in submitted state" });
      }

      goalSheet.status = "approved";
      goalSheet.approved_by = req.user.id;
      goalSheet.approved_at = new Date();
      goalSheet.is_locked = true;
      await goalSheet.save();

      res.json({ message: "Goals approved", goalSheet });
    } catch (error) {
      res.status(500).json({ error: "Approval failed" });
    }
  });

  router.patch("/reject/:goalSheetId", authenticateToken, requireRole("manager", "admin"), async (req, res) => {
    try {
      const { rejection_reason } = req.body;
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet || goalSheet.status !== "submitted") {
        return res.status(400).json({ error: "Goal sheet not in submitted state" });
      }

      goalSheet.status = "rejected";
      goalSheet.rejection_reason = rejection_reason;
      await goalSheet.save();

      res.json({ message: "Goals rejected", goalSheet });
    } catch (error) {
      res.status(500).json({ error: "Rejection failed" });
    }
  });

  return router;
};
