const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cycle = sequelize.define("Cycle", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cycle_year: {
      type: DataTypes.INTEGER,
    },
    phase_name: {
      type: DataTypes.STRING,
    },
    window_open_date: {
      type: DataTypes.DATEONLY,
    },
    window_close_date: {
      type: DataTypes.DATEONLY,
    },
    created_by: {
      type: DataTypes.UUID,
    },
  }, {
    tableName: "cycles",
    timestamps: false,
  });

  Cycle.prototype.isWindowOpen = function () {
    const today = new Date();
    const openDate = new Date(this.window_open_date);
    const closeDate = new Date(this.window_close_date);
    return today >= openDate && today <= closeDate;
  };

  return Cycle;
};
