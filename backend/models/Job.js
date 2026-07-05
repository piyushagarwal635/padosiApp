const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Job = sequelize.define("Job", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  distance: {
    type: DataTypes.STRING,
    defaultValue: "Nearby",
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "completed", "declined"),
    defaultValue: "pending",
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  urgency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

module.exports = Job;
