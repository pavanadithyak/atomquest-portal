const express = require("express");
const { authenticateToken } = require("../middleware/auth");

module.exports = (sequelize, User, GoalSheet, Goal) => {
  const router = express.Router();

  router.post("/", authenticateToken, async (req, res) => {
    try {
      const { cycle_id, goals } = req.body;
      const employee_id = req.body.employee_id || req.user.id;

      if (!Array.isArray(goals) || goals.length === 0 || goals.length > 8) {
        return res.status(400).json({ error: "Goals array required (1-8 goals)" });
      }

      for (const goal of goals) {
        if (!goal.weightage || goal.weightage < 10) {
          return res.status(400).json({ error: "Each goal must be minimum 10% weightage" });
        }
      }

      const totalWeightage = goals.reduce((sum, g) => sum + parseFloat(g.weightage || 0), 0);
      if (Math.abs(totalWeightage - 100.00) > 0.01) {
        return res.status(400).json({ error: "Total weightage must equal 100.00% exactly" });
      }

      const goalSheet = await GoalSheet.create({
        employee_id,
        cycle_id,
        status: "draft",
        total_weightage: parseFloat(totalWeightage.toFixed(2)),
      });

      const createdGoals = await Promise.all(
        goals.map(g =>
          Goal.create({
            goal_sheet_id: goalSheet.id,
            thrust_area: g.thrust_area,
            title: g.title,
            description: g.description,
            uom_type: g.uom_type,
            target_value: g.target_value,
            weightage: parseFloat(g.weightage),
            is_shared: false,
          })
        )
      );

      res.status(201).json({ goalSheet, goals: createdGoals });
    } catch (error) {
      console.error("Goal creation error:", error);
      res.status(500).json({ error: "Goal creation failed" });
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
        const reportIds = reports.map(r => r.id);
        where.employee_id = reportIds;
      }

      const goalSheets = await GoalSheet.findAll({
        where,
        include: [{ model: Goal, as: "goals" }],
      });

      res.json(goalSheets);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ error: "Error fetching goals" });
    }
  });

  router.get("/:goalSheetId", authenticateToken, async (req, res) => {
    try {
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId, {
        include: [{ model: Goal, as: "goals" }, { model: User, as: "employee", attributes: ["id", "first_name", "last_name"] }],
      });
      if (!goalSheet) {
        return res.status(404).json({ error: "Goal sheet not found" });
      }
      res.json(goalSheet);
    } catch (error) {
      console.error("Get goal sheet error:", error);
      res.status(500).json({ error: "Error fetching goal sheet" });
    }
  });

  router.patch("/:goalSheetId", authenticateToken, async (req, res) => {
    try {
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet) {
        return res.status(404).json({ error: "Goal sheet not found" });
      }

      if (goalSheet.status !== "draft" && req.user.role !== "admin") {
        return res.status(403).json({ error: "Goal sheet is locked or already processed" });
      }

      const { goals } = req.body;
      if (goals && Array.isArray(goals)) {
        const totalWeightage = goals.reduce((sum, g) => sum + parseFloat(g.weightage || 0), 0);
        if (Math.abs(totalWeightage - 100.00) > 0.01) {
          return res.status(400).json({ error: "Total weightage must equal 100.00%" });
        }

        await Goal.destroy({ where: { goal_sheet_id: goalSheet.id } });
        const createdGoals = await Promise.all(
          goals.map(g =>
            Goal.create({
              goal_sheet_id: goalSheet.id,
              ...g,
            })
          )
        );

        goalSheet.total_weightage = totalWeightage;
        await goalSheet.save();

        res.json({ goalSheet, goals: createdGoals });
      }
    } catch (error) {
      console.error("Goal update error:", error);
      res.status(500).json({ error: "Goal update failed" });
    }
  });

  router.patch("/:goalSheetId/status", authenticateToken, async (req, res) => {
    try {
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet) {
        return res.status(404).json({ error: "Goal sheet not found" });
      }

      if (goalSheet.employee_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Not authorized to submit this goal sheet" });
      }

      if (goalSheet.status !== "draft") {
        return res.status(400).json({ error: "Only draft goal sheets can be submitted" });
      }

      const { status } = req.body;
      if (status !== "submitted") {
        return res.status(400).json({ error: "Status must be 'submitted'" });
      }

      goalSheet.status = "submitted";
      await goalSheet.save();

      res.json({ message: "Goal sheet submitted for approval", goalSheet });
    } catch (error) {
      console.error("Status update error:", error);
      res.status(500).json({ error: "Status update failed" });
    }
  });

  router.delete("/:goalSheetId", authenticateToken, async (req, res) => {
    try {
      const goalSheet = await GoalSheet.findByPk(req.params.goalSheetId);
      if (!goalSheet || goalSheet.status !== "draft") {
        return res.status(403).json({ error: "Can only delete draft goal sheets" });
      }

      await Goal.destroy({ where: { goal_sheet_id: goalSheet.id } });
      await goalSheet.destroy();

      res.json({ message: "Goal sheet deleted" });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  return router;
};
