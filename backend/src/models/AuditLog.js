const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AuditLog = sequelize.define("AuditLog", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING,
    },
    entity_id: {
      type: DataTypes.UUID,
    },
    old_value: {
      type: DataTypes.TEXT,
    },
    new_value: {
      type: DataTypes.TEXT,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },
  }, {
    tableName: "audit_logs",
    timestamps: false,
  });

  return AuditLog;
};
