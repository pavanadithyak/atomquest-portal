const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CheckIn = sequelize.define("CheckIn", {
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
    manager_id: {
      type: DataTypes.UUID,
    },
    quarter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manager_comment: {
      type: DataTypes.TEXT,
    },
    confidence_level: {
      type: DataTypes.ENUM("low", "medium", "high"),
    },
    support_needed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: "check_ins",
    timestamps: true,
    underscored: true,
  });

  return CheckIn;
};
