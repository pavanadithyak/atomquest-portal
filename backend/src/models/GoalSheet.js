const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoalSheet = sequelize.define("GoalSheet", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    cycle_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"),
      defaultValue: "draft",
    },
    total_weightage: {
      type: DataTypes.DECIMAL(5, 2),
    },
    submitted_at: {
      type: DataTypes.DATE,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
    approved_at: {
      type: DataTypes.DATE,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: "goal_sheets",
    timestamps: true,
    underscored: true,
  });

  return GoalSheet;
};
