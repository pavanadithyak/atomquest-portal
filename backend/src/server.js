require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || "atomquest",
  process.env.POSTGRES_USER || "postgres",
  process.env.POSTGRES_PASSWORD || "change_me",
  {
    host: process.env.POSTGRES_HOST || "postgres",
    port: process.env.POSTGRES_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

// Initialize models
const User = require("./models/User")(sequelize);
const GoalSheet = require("./models/GoalSheet")(sequelize);
const Goal = require("./models/Goal")(sequelize);
const Achievement = require("./models/Achievement")(sequelize);
const Cycle = require("./models/Cycle")(sequelize);
const CheckIn = require("./models/CheckIn")(sequelize);
const AuditLog = require("./models/AuditLog")(sequelize);

// Associations
GoalSheet.hasMany(Goal, { foreignKey: "goal_sheet_id", as: "goals" });
Goal.belongsTo(GoalSheet, { foreignKey: "goal_sheet_id", as: "goalSheet" });
User.hasMany(GoalSheet, { foreignKey: "employee_id" });
GoalSheet.belongsTo(User, { foreignKey: "employee_id", as: "employee" });
Achievement.belongsTo(Goal, { foreignKey: "goal_id", as: "goal" });
Goal.hasMany(Achievement, { foreignKey: "goal_id", as: "achievements" });
CheckIn.belongsTo(Goal, { foreignKey: "goal_id", as: "goal" });

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const authRoutes = require("./routes/auth")(sequelize);
const goalRoutes = require("./routes/goals")(sequelize, User, GoalSheet, Goal);
const managerRoutes = require("./routes/manager")(sequelize, User, GoalSheet, Goal);
const sharedGoalRoutes = require("./routes/shared-goals")(sequelize);
const achievementRoutes = require("./routes/achievements")(sequelize, User, Achievement, Goal, Cycle);
const checkInRoutes = require("./routes/check-ins")(sequelize, User, GoalSheet, Goal, CheckIn, Achievement);

app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin/shared-goals", sharedGoalRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/check-ins", checkInRoutes);

const cycleRoutes = require("./routes/cycles")(sequelize, Cycle);
app.use("/api/cycles", cycleRoutes);

const adminRoutes = require("./routes/admin")(sequelize, GoalSheet, Goal, Achievement, AuditLog, User);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
