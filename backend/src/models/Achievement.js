const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Achievement = sequelize.define("Achievement", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    goal_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quarter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actual_value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM("pending", "on_track", "at_risk", "completed", "overdue"),
      defaultValue: "pending",
    },
    employee_comments: {
      type: DataTypes.TEXT,
    },
    progress_score: {
      type: DataTypes.DECIMAL(3, 2),
    },
  }, {
    tableName: "achievements",
    timestamps: true,
    underscored: true,
  });

  return Achievement;
};
