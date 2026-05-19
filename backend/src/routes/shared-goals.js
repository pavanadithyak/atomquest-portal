const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");

module.exports = (sequelize) => {
  const router = express.Router();
  const Goal = require("../models/Goal")(sequelize);
  const GoalSheet = require("../models/GoalSheet")(sequelize);
  const User = require("../models/User")(sequelize);

  router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const { goal_template, recipient_employee_ids } = req.body;

      if (!goal_template || !Array.isArray(recipient_employee_ids)) {
        return res.status(400).json({ error: "goal_template and recipient_employee_ids required" });
      }

      const [cycle] = await sequelize.query(
        "SELECT id FROM cycles ORDER BY created_at DESC LIMIT 1",
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!cycle) {
        return res.status(400).json({ error: "No active cycle found" });
      }

      const createdGoals = [];
      for (const empId of recipient_employee_ids) {
        const employee = await User.findByPk(empId);
        if (!employee) continue;

        let goalSheet = await GoalSheet.findOne({
          where: { employee_id: empId, cycle_id: cycle.id },
        });

        if (!goalSheet) {
          goalSheet = await GoalSheet.create({
            employee_id: empId,
            cycle_id: cycle.id,
            status: "draft",
          });
        }

        const goal = await Goal.create({
          goal_sheet_id: goalSheet.id,
          ...goal_template,
          is_shared: true,
          weightage: 0,
        });

        createdGoals.push(goal);
      }

      res.status(201).json({
        message: "Shared goals pushed",
        recipient_count: createdGoals.length,
        goals: createdGoals,
      });
    } catch (error) {
      console.error("Shared goal error:", error);
      res.status(500).json({ error: "Shared goal push failed" });
    }
  });

  return router;
};
