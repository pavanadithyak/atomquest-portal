const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Goal = sequelize.define("Goal", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    goal_sheet_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    thrust_area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    uom_type: {
      type: DataTypes.STRING,
    },
    target_value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    weightage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    is_shared: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    primary_goal_id: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: "goals",
    timestamps: true,
    underscored: true,
  });

  return Goal;
};
